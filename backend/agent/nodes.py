import json
import logging
import os
import re
from datetime import datetime

from pathlib import Path

from dotenv import load_dotenv
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from .state import AgentState

dotenv_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path)

logger = logging.getLogger(__name__)

FORBIDDEN_PHRASES = [
    "you will definitely", "guaranteed", "you must", "diagnosis",
    "invest in", "legally required", "prescribe", "cure",
    "you should buy", "certainty", "without a doubt",
]

SAFETY_DISCLAIMER = (
    "\n\n*As always, please remember that astrology is a tool for self-reflection "
    "and guidance — not a substitute for professional medical, legal, or financial advice. "
    "Trust yourself and your own discernment above all else.*"
)

# ── Provider resolution ────────────────────────────────────────────────────────
# Supports both Groq and OpenAI.
# Priority:
#   1. GROQ_API_KEY  → uses Groq's OpenAI-compatible endpoint
#   2. OPENAI_API_KEY + optional OPENAI_BASE_URL → standard OpenAI / any compatible

_GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
_OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
_OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "")

# Default model: prefer MODEL_NAME env var, then provider-specific defaults
_DEFAULT_MODEL = os.getenv("MODEL_NAME", "")

if _GROQ_API_KEY:
    _LLM_API_KEY = _GROQ_API_KEY
    _LLM_BASE_URL = "https://api.groq.com/openai/v1"
    # Groq model defaults — llama-3.3-70b-versatile supports tool calling
    ROUTER_MODEL = os.getenv("ROUTER_MODEL", _DEFAULT_MODEL or "llama-3.1-8b-instant")
    REASONER_MODEL = os.getenv("REASONER_MODEL", _DEFAULT_MODEL or "llama-3.3-70b-versatile")
else:
    _LLM_API_KEY = _OPENAI_API_KEY
    _LLM_BASE_URL = _OPENAI_BASE_URL
    ROUTER_MODEL = os.getenv("ROUTER_MODEL", _DEFAULT_MODEL or "gpt-4o-mini")
    REASONER_MODEL = os.getenv("REASONER_MODEL", _DEFAULT_MODEL or "gpt-4o")

_llm_kwargs: dict = {"api_key": _LLM_API_KEY}
if _LLM_BASE_URL:
    _llm_kwargs["base_url"] = _LLM_BASE_URL

logger.info(
    f"LLM provider: {'Groq' if _GROQ_API_KEY else 'OpenAI'} | "
    f"router={ROUTER_MODEL} | reasoner={REASONER_MODEL}"
)


def _create_llm(model: str, temperature: float = 0, max_tokens: int | None = None, tags: list[str] | None = None) -> ChatOpenAI:
    kwargs = {**_llm_kwargs, "model": model, "temperature": temperature}
    if max_tokens is not None:
        kwargs["max_tokens"] = max_tokens
    if tags:
        kwargs["tags"] = tags
    return ChatOpenAI(**kwargs)


def safety_check(text: str) -> str:
    lower = text.lower()
    for phrase in FORBIDDEN_PHRASES:
        if phrase in lower:
            if SAFETY_DISCLAIMER not in text:
                return text + SAFETY_DISCLAIMER
            break
    return text


ROUTER_PROMPT = SystemMessage(
    "You are an intent classifier for an astrology assistant. "
    "Classify the user's message into exactly one of these intents:\n"
    "- chart_request: user is asking for a birth chart / natal chart to be computed. "
    "They may provide birth details (date, time, place) or just ask generally.\n"
    "- daily_horoscope: user is asking about today's energy, transits, "
    "what the stars say about today, etc.\n"
    "- free_question: user is asking about astrology topics like career, "
    "relationships, Saturn return, houses, signs, etc.\n"
    "- off_topic: user is asking about medical, financial, legal advice, "
    "or anything unrelated to astrology.\n\n"
    "Also extract any birth details found: date (YYYY-MM-DD), time (HH:MM), place (city name).\n\n"
    "Respond with valid JSON only: "
    '{"intent": "...", "birth_date": null|"...", "birth_time": null|"...", "birth_place": null|"..."}'
)


def router_node(state: AgentState) -> AgentState:
    last_user_msg = ""
    for m in reversed(state["messages"]):
        if isinstance(m, HumanMessage):
            last_user_msg = m.content
            break

    llm = _create_llm(model=ROUTER_MODEL, temperature=0, max_tokens=200, tags=["router"])
    try:
        response = llm.invoke([ROUTER_PROMPT, HumanMessage(content=last_user_msg)])
        text = response.content.strip()
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
        parsed = json.loads(text)
        intent = parsed.get("intent", "free_question")
        bd = {}
        if parsed.get("birth_date"):
            bd["date"] = parsed["birth_date"]
        if parsed.get("birth_time"):
            bd["time"] = parsed["birth_time"]
        if parsed.get("birth_place"):
            bd["place"] = parsed["birth_place"]
        state["intent"] = intent
        if bd:
            existing = state.get("birth_details") or {}
            existing.update(bd)
            state["birth_details"] = existing
    except Exception as e:
        logger.warning(f"Router parse failed: {e}")
        state["intent"] = "free_question"

    return state


LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "bn": "Bengali", "te": "Telugu",
    "mr": "Marathi", "ta": "Tamil", "gu": "Gujarati", "kn": "Kannada",
    "ml": "Malayalam", "pa": "Punjabi",
}

def reasoner_node(state: AgentState) -> AgentState:
    step_count = state.get("step_count", 0)
    step_budget = int(os.getenv("MAX_AGENT_STEPS", "8"))
    today_date = datetime.now().strftime("%Y-%m-%d")
    language = state.get("language", "en")
    lang_name = LANGUAGE_NAMES.get(language, "English")

    astrologer_prompt = (
        "You are Aradhana, a warm, calm, spiritually grounded astrologer. "
        "You speak with gentle wisdom and cosmic insight. "
        "You may never present astrological readings as medical, financial, legal, or predictive certainty. "
        "Always remind users that astrology is for self-reflection and guidance only.\n\n"
        f"Today's date is {today_date}. Use this when calling tools that need a date.\n"
        f"Step budget: {step_count}/{step_budget} steps used.\n"
    )

    if language != "en":
        astrologer_prompt += f"\nThe user prefers communication in {lang_name}. Please respond entirely in {lang_name}.\n"

    bd = state.get("birth_details")
    if bd:
        astrologer_prompt += "\nThe user has already provided their birth details via the form. Do NOT ask for them again:\n"
        if bd.get("name"): astrologer_prompt += f"  Name: {bd['name']}\n"
        if bd.get("date"): astrologer_prompt += f"  Date of Birth: {bd['date']}\n"
        if bd.get("time"): astrologer_prompt += f"  Time of Birth: {bd['time']}\n"
        if bd.get("place"): astrologer_prompt += f"  Place of Birth: {bd['place']}\n"
        astrologer_prompt += "\nCompute the chart directly — no need to ask for details again.\n"

    if state.get("natal_chart"):
        astrologer_prompt += f"\nCurrent natal chart:\n{json.dumps(state['natal_chart'], indent=2)}\n"

    if state.get("tool_outputs"):
        astrologer_prompt += f"\nRecent tool outputs:\n{json.dumps(state['tool_outputs'][-3:], indent=2)}\n"

    messages = [SystemMessage(content=astrologer_prompt)] + state["messages"]

    llm = _create_llm(model=REASONER_MODEL, temperature=0.7, max_tokens=2048, tags=["reasoner"])

    from .tools import (
        compute_birth_chart,
        geocode_place,
        get_daily_transits,
        knowledge_lookup,
    )

    tools = [geocode_place, compute_birth_chart, get_daily_transits, knowledge_lookup]
    llm_with_tools = llm.bind_tools(tools, tool_choice="auto")

    try:
        response = llm_with_tools.invoke(messages)
        if hasattr(response, "tool_calls") and response.tool_calls:
            state["messages"].append(response)
            state["step_count"] = step_count + 1
        else:
            content = response.content
            content = safety_check(content)
            state["messages"].append(AIMessage(content=content))
    except Exception as e:
        logger.exception("Reasoner failed")
        state["messages"].append(AIMessage(
            content=f"I'm sorry, I encountered an issue connecting to my inner wisdom. "
                    f"Please try again. (Error: {type(e).__name__})"
        ))

    return state


def respond_node(state: AgentState) -> AgentState:
    last_msg = state["messages"][-1] if state["messages"] else None
    if last_msg and hasattr(last_msg, "content") and isinstance(last_msg, AIMessage):
        last_msg.content = safety_check(last_msg.content)
    if not last_msg or not last_msg.content:
        state["messages"].append(AIMessage(
            content="I sense the cosmic energies are shifting. Could you ask your question again?"
        ))
    return state
