import json
import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

dotenv_path = Path(__file__).resolve().parent.parent / "backend" / ".env"
if not dotenv_path.exists():
    dotenv_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path)

logger = logging.getLogger(__name__)

_GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
_OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
_OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "")

if _GROQ_API_KEY:
    _llm_kwargs: dict = {
        "api_key": _GROQ_API_KEY,
        "base_url": "https://api.groq.com/openai/v1",
    }
else:
    _llm_kwargs = {"api_key": _OPENAI_API_KEY}
    if _OPENAI_BASE_URL:
        _llm_kwargs["base_url"] = _OPENAI_BASE_URL

JUDGE_PROMPT = """You are an eval judge for an astrology AI assistant called AstroAgent (persona: Aradhana).
Rate the assistant's response on three dimensions (1-5 scale) using the rubrics below.

Reference answer (gold standard): {reference}

User query: {query}

Assistant response: {response}

---
### Dimension 1: tone_warmth
Is the response warm, calm, spiritually grounded, and appropriate for a spiritual guide?
1 - Cold, robotic, or overly clinical
2 - Mostly neutral, little warmth
3 - Adequately warm and polite
4 - Warm and calming, good spiritual tone
5 - Exceptionally warm, poetic, spiritually resonant

### Dimension 2: helpfulness
Does the response directly address what was asked?
1 - Ignores the query entirely
2 - Addresses it tangentially or vaguely
3 - Addresses the query adequately
4 - Addresses it clearly and thoroughly
5 - Goes above and beyond, anticipates follow-up needs

### Dimension 3: groundedness
Does the response cite specific astrological concepts, placements, or chart details rather than vague generalities?
1 - Entirely generic, no astrology-specific content
2 - Mentions astrology but no specifics
3 - Cites some astrological concepts or terms
4 - Cites specific placements, aspects, or chart details
5 - Rich in specific, accurate astrological detail with precise references

Return ONLY valid JSON with keys: tone_warmth (int), helpfulness (int), groundedness (int), reasoning (str).
"""


async def judge_response(query: str, response: str, reference: str = "", model: str = "gpt-4o-mini") -> dict:
    try:
        llm_kwargs = {**_llm_kwargs, "model": model, "temperature": 0, "max_tokens": 500}
        llm = ChatOpenAI(**llm_kwargs)
        prompt = JUDGE_PROMPT.format(query=query, response=response, reference=reference)
        result = await llm.ainvoke(prompt)
        text = result.content.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            text = text.rsplit("\n", 1)[0]
            if text.endswith("```"):
                text = text[:-3]
        parsed = json.loads(text)
        return {
            "tone_warmth": int(parsed.get("tone_warmth", 3)),
            "helpfulness": int(parsed.get("helpfulness", 3)),
            "groundedness": int(parsed.get("groundedness", 3)),
            "reasoning": parsed.get("reasoning", ""),
        }
    except Exception as e:
        logger.exception(f"Judge failed: {e}")
        return {"tone_warmth": 0, "helpfulness": 0, "groundedness": 0, "reasoning": f"Judge error: {str(e)}"}
