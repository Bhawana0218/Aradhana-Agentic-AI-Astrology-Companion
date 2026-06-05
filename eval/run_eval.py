#!/usr/bin/env python3
"""AstroAgent Evaluation Runner.

Usage:
    cd astroagent && python eval/run_eval.py
"""

import asyncio
import json
import logging
import os
import random
import sys
import time
from datetime import datetime
from pathlib import Path

from pathlib import Path

from dotenv import load_dotenv

dotenv_path = Path(__file__).resolve().parent.parent / "backend" / ".env"
if not dotenv_path.exists():
    dotenv_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path)

sys.path.insert(0, str(Path(__file__).parent.parent))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

from backend.agent.graph import agent_graph
from eval.checkers import (
    check_latency,
    check_no_hallucinated_positions,
    check_safety_guardrail,
    check_step_budget,
    check_sun_sign,
    check_tool_called,
)
from eval.judges import judge_response

GOLDEN_SET_PATH = Path(__file__).parent / "golden_set.jsonl"
RESULTS_DIR = Path(__file__).parent / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
EVAL_MODEL = os.getenv(
    "EVAL_MODEL",
    os.getenv("MODEL_NAME", "llama-3.3-70b-versatile" if os.getenv("GROQ_API_KEY") else "gpt-4o-mini"),
)


def load_golden_set() -> list[dict]:
    cases = []
    with open(GOLDEN_SET_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                cases.append(json.loads(line))
    return cases


async def run_single_case(case: dict) -> dict:
    inp = case["input"]
    birth_details = inp.get("birth_details")

    initial_state = {
        "messages": [{"role": "user", "content": inp["message"]}],
        "birth_details": birth_details,
        "natal_chart": None,
        "intent": None,
        "tool_outputs": [],
        "session_id": f"eval-{case['id']}",
        "step_count": 0,
    }

    # We need to use the graph with proper messages. Let's do a simplified run.
    from langchain_core.messages import HumanMessage

    initial_state["messages"] = [HumanMessage(content=inp["message"])]

    start = time.monotonic()
    response_text = ""
    response_log = []
    final_state = None
    tool_calls_executed = []
    chart_output = None

    try:
        async for event in agent_graph.astream_events(initial_state, version="v2"):
            kind = event.get("event", "")
            if kind == "on_chat_model_stream":
                chunk = event.get("data", {}).get("chunk", None)
                if chunk and hasattr(chunk, "content") and chunk.content:
                    response_text += chunk.content
            elif kind == "on_tool_start":
                tool_name = event.get("name", "unknown")
                tool_input = event.get("data", {}).get("input", {})
                response_log.append({"type": "tool_start", "tool": tool_name, "input": tool_input})
            elif kind == "on_tool_end":
                tool_name = event.get("name", "unknown")
                tool_output = event.get("data", {}).get("output", "")
                if isinstance(tool_output, str):
                    try:
                        tool_output = json.loads(tool_output)
                    except (json.JSONDecodeError, TypeError):
                        pass
                if tool_name == "compute_birth_chart":
                    chart_output = tool_output
                response_log.append({"type": "tool_end", "tool": tool_name, "output": tool_output})
                tool_calls_executed.append(tool_name)
    except Exception as e:
        logger.exception(f"Case {case['id']} failed during graph run")
        response_text += f"\n[Error: {str(e)}]"

    elapsed_ms = (time.monotonic() - start) * 1000

    step_count = 0
    for entry in response_log:
        if entry["type"] == "tool_end":
            step_count += 1

    return {
        "case_id": case["id"],
        "category": case["category"],
        "response": response_text,
        "response_log": response_log,
        "chart_output": chart_output,
        "tool_calls_executed": tool_calls_executed,
        "step_count": step_count,
        "elapsed_ms": elapsed_ms,
        "expected": case["expected"],
    }


async def main():
    cases = load_golden_set()
    logger.info(f"Loaded {len(cases)} test cases")

    results = []
    for case in cases:
        logger.info(f"Running case {case['id']} ({case['category']})...")
        result = await run_single_case(case)
        results.append(result)
        logger.info(f"  Done: {len(result['response'])} chars, {result['step_count']} steps, {result['elapsed_ms']:.0f}ms")

    # Run deterministic checkers
    pass_by_category = {}
    total_cases = len(results)
    total_pass = 0
    fail_details = []

    for r in results:
        cat = r["category"]
        if cat not in pass_by_category:
            pass_by_category[cat] = {"pass": 0, "total": 0, "total_ms": 0.0, "total_steps": 0, "total_tool_calls": 0}

        pass_by_category[cat]["total"] += 1
        pass_by_category[cat]["total_ms"] += r["elapsed_ms"]
        pass_by_category[cat]["total_steps"] += r["step_count"]
        pass_by_category[cat]["total_tool_calls"] += len(r["tool_calls_executed"])

        exp = r["expected"]
        checks_passed = True
        failed_checks = []

        # Tool called check
        if exp.get("tools_called") is not None:
            tc = check_tool_called(r["response_log"], exp["tools_called"])
            if not tc:
                checks_passed = False
                failed_checks.append(f"tools_called (expected {exp['tools_called']}, got {r['tool_calls_executed']})")

        # Sun sign check
        if exp.get("reference_chart_sun_sign") and r["chart_output"]:
            ss = check_sun_sign(r["chart_output"], exp["reference_chart_sun_sign"])
            if not ss:
                checks_passed = False
                failed_checks.append(f"sun_sign (expected {exp['reference_chart_sun_sign']})")

        # Safety guardrail
        sg = check_safety_guardrail(r["response"])
        if not sg:
            checks_passed = False
            failed_checks.append("safety_guardrail")

        # Step budget
        sb = check_step_budget(r["step_count"])
        if not sb:
            checks_passed = False
            failed_checks.append(f"step_budget ({r['step_count']} > 8)")

        # Latency
        lat = check_latency(r["elapsed_ms"])
        if not lat:
            checks_passed = False
            failed_checks.append(f"latency ({r['elapsed_ms']:.0f}ms > 15000ms)")

        # Hallucinated positions
        hp = check_no_hallucinated_positions(r["chart_output"])
        if not hp:
            checks_passed = False
            failed_checks.append("hallucinated_positions")

        # Content must_contain
        must_contain = exp.get("must_contain", [])
        for mc in must_contain:
            if mc.lower() not in r["response"].lower():
                checks_passed = False
                failed_checks.append(f"must_contain '{mc}'")

        # Content must_not_contain
        must_not_contain = exp.get("must_not_contain", [])
        for mnc in must_not_contain:
            if mnc.lower() in r["response"].lower():
                checks_passed = False
                failed_checks.append(f"must_not_contain '{mnc}'")

        if checks_passed:
            pass_by_category[cat]["pass"] += 1
            total_pass += 1
        else:
            fail_details.append({"id": r["case_id"], "failed_checks": failed_checks})

    # Run LLM judges on random 10-case sample
    sample_cases = random.sample(results, min(10, len(results)))
    judge_results = []
    for r in sample_cases:
        exp = r["expected"]
        ref = exp.get("reference_answer", "")
        jr = await judge_response(
            query=r["response_log"][0]["input"] if r["response_log"] else "",
            response=r["response"],
            reference=ref,
            model=EVAL_MODEL,
        )
        judge_results.append(jr)

    avg_tone = sum(j.get("tone_warmth", 0) for j in judge_results) / max(len(judge_results), 1)
    avg_helpful = sum(j.get("helpfulness", 0) for j in judge_results) / max(len(judge_results), 1)
    avg_grounded = sum(j.get("groundedness", 0) for j in judge_results) / max(len(judge_results), 1)

    # Scorecard
    overall_pass_pct = (total_pass / total_cases) * 100 if total_cases else 0

    scorecard_lines = []
    scorecard_lines.append("╔══════════════════════════════════════════════════════════════╗")
    scorecard_lines.append(f"║ AstroAgent Eval Scorecard — {datetime.now().strftime('%Y-%m-%d')}                     ║")
    scorecard_lines.append("╠══════════════════╦═══════╦════════╦═════════╦═══════════════╣")
    scorecard_lines.append("║ Category         ║ Pass% ║ Avg ms ║ Avg $   ║ Tool calls    ║")
    scorecard_lines.append("╠══════════════════╬═══════╬════════╬═════════╬═══════════════╣")

    all_avg_ms = 0
    all_avg_steps = 0
    all_avg_tc = 0
    cat_count = 0

    for cat, data in sorted(pass_by_category.items()):
        pct = (data["pass"] / data["total"]) * 100
        avg_ms = data["total_ms"] / data["total"]
        avg_steps = data["total_steps"] / data["total"]
        avg_tc = data["total_tool_calls"] / data["total"]
        all_avg_ms += avg_ms
        all_avg_steps += avg_steps
        all_avg_tc += avg_tc
        cat_count += 1
        label = cat.ljust(16)
        scorecard_lines.append(f"║ {label}║ {pct:5.1f}% ║ {avg_ms:6.0f} ║ {avg_steps:5.1f}   ║ {avg_tc:5.1f}          ║")

    scorecard_lines.append("╠══════════════════╬═══════╬════════╬═════════╬═══════════════╣")

    overall_avg_ms = all_avg_ms / max(cat_count, 1)
    overall_avg_steps = all_avg_steps / max(cat_count, 1)
    overall_avg_tc = all_avg_tc / max(cat_count, 1)

    scorecard_lines.append(f"║ OVERALL {' '.ljust(9)}║ {overall_pass_pct:5.1f}% ║ {overall_avg_ms:6.0f} ║ {overall_avg_steps:5.1f}   ║ {overall_avg_tc:5.1f}          ║")
    scorecard_lines.append("╚══════════════════╩═══════╩════════╩═════════╩═══════════════╝")
    scorecard_lines.append(f"LLM-Judge ({len(judge_results)} samples): tone={avg_tone:.1f} helpfulness={avg_helpful:.1f} groundedness={avg_grounded:.1f}")
    scorecard_lines.append(f"Judge agreement rate: N/A (single judge)")

    if fail_details:
        scorecard_lines.append("\n### Failed Cases")
        for fd in fail_details:
            scorecard_lines.append(f"- {fd['id']}: {', '.join(fd['failed_checks'])}")

    scorecard = "\n".join(scorecard_lines)
    print("\n" + scorecard + "\n")

    # Save results
    date_str = datetime.now().strftime("%Y-%m-%d")
    result_file = RESULTS_DIR / f"scorecard_{date_str}.md"
    result_file.write_text(scorecard, encoding="utf-8")
    logger.info(f"Scorecard saved to {result_file}")

    if overall_pass_pct < 70:
        logger.error(f"Overall pass rate {overall_pass_pct:.1f}% < 70% — exiting with code 1")
        sys.exit(1)

    logger.info(f"Overall pass rate: {overall_pass_pct:.1f}% — PASSED")
    sys.exit(0)


if __name__ == "__main__":
    asyncio.run(main())
