# AstroAgent Evaluation Results

## What the Eval Revealed

The evaluation harness runs 30 golden-set cases across 6 categories against deterministic checkers and a sampled LLM-as-judge. The structure is designed to catch regressions in:

1. **Intent classification** — Does the router correctly identify chart requests vs off-topic queries?
2. **Tool invocation** — Are the right tools called? Charts must trigger `compute_birth_chart`.
3. **Astrological accuracy** — Is the computed Sun sign correct for the given date/location?
4. **Safety behavior** — Does the assistant decline medical, financial, and legal questions?
5. **Adversarial robustness** — Can prompt injections break the system prompt?
6. **Edge case handling** — Pre-1900 dates, leap year births, unknown times, ambiguous input.

---

## Failure Modes Found

### Intent Misclassification
- Ambiguous queries like "What's my chart?" without details may be classified as `free_question` instead of `chart_request`.
- Queries with partial details (date only, no time, no place) get routed to `chart_request` but may fail gracefully when the tool can't proceed.

### Geocoding Failures
- Nominatim is rate-limited to 1 request/second — parallel eval runs may hit limits.
- Obscure or misspelled location names may return "not found" even for valid intent.

### Chart Computation Edge Cases
- pyswisseph has known limitations for dates before year 1800 (Gregorian calendar issues).
- Timezone history is not accounted for — historical timezone offsets may be wrong.
- Leap second handling is ignored.

### Safety Trade-offs
- The hardcoded forbidden-phrase list is a blunt instrument — false positives are possible (e.g., "you must" in "you must be curious about").
- Some adversarial prompts may still slip through depending on LLM behavior.

---

## What I'd Fix with More Time

1. **Better router**: Train a small classifier or use few-shot examples in the router prompt to improve intent accuracy.
2. **Historical timezones**: Use `timezonefinder` with historical data or `pytz`'s `timezone.localize()` with appropriate flags.
3. **Multi-LLM support**: Add Claude, Gemini, and local models as configurable backends.
4. **Caching**: Cache geocoding results and computed charts to speed up repeated queries.
5. **Factuality checker**: Add a second LLM call to verify generated chart statements against the computed data.
6. **More RAG docs**: Expand the knowledge base with 50+ reference documents covering all major astrological topics.
7. **UI polish**: Add conversation export, dark/light toggle, and mobile bottom sheet for birth details.

---

## Judge Agreement & Spot-Check Notes

The LLM-as-judge uses `gpt-4o-mini` with a rubric prompt. Key observations:

- **Tone warmth** tends to rate 4+ consistently because the system prompt enforces Aradhana's persona.
- **Helpfulness** varies — the judge penalizes responses that are too short or ask for clarification.
- **Groundedness** is the hardest dimension — chart-heavy responses score well, but general horoscope responses can feel generic.

A human spot-check of 5 cases showed ~80% agreement with the LLM judge. The main disagreements were on groundedness (human raters were more generous about "specific enough").

---

## Cost & Latency Analysis

| Category | Avg Latency | Avg Cost Estimate |
|---|---|---|
| chart_request | ~6-8s | ~$0.03 (2-3 LLM calls + tool) |
| daily_horoscope | ~3-5s | ~$0.02 (1-2 LLM calls + RAG) |
| free_question | ~3-5s | ~$0.015 (1 LLM call + RAG) |
| off_topic | ~2-3s | ~$0.01 (1 quick LLM call) |
| adversarial | ~2-4s | ~$0.01 (1 quick LLM call) |
| edge_case | ~5-8s | ~$0.03 (2-3 LLM calls + tool) |

Cost is dominated by the `gpt-4o` call in `reasoner_node`. The `gpt-4o-mini` call in `router_node` is negligible (~$0.001). Evaluation of all 30 cases costs approximately $0.50-0.70 in total.

Latency is dominated by LLM inference time. Streaming helps perceived performance — users see the first tokens within 1-2 seconds even if the full response takes 5-8 seconds.
