import json
import logging
import time
import uuid
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from langchain_core.messages import AIMessage, HumanMessage
from sse_starlette.sse import EventSourceResponse

from ..agent.graph import agent_graph
from ..agent.tools import compute_birth_chart, geocode_place, get_daily_transits
from .schemas import (
    ChartRequest,
    ChartResponse,
    ChatRequest,
    CosmicEventsResponse,
    CreateSessionResponse,
    DailyGuidanceResponse,
    GeocodeRequest,
    GeocodeResponse,
    GuidanceSectionSchema,
    HealthResponse,
    SessionHistoryResponse,
    TransitsRequest,
    TransitsResponse,
)
from ..db.crud import append_message, create_session, get_history

dotenv_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path)

logger = logging.getLogger(__name__)
router = APIRouter()

_rate_limit_store: dict[str, list[float]] = {}


def _serialize_tool_output(output: object) -> object:
    if hasattr(output, "content"):
        try:
            return json.loads(output.content) if isinstance(output.content, str) else output.content
        except (json.JSONDecodeError, TypeError, ValueError):
            return str(output.content)[:2000]
    if isinstance(output, (str, bytes, bytearray)):
        try:
            return json.loads(output) if isinstance(output, str) else output
        except (json.JSONDecodeError, TypeError, ValueError):
            return str(output)[:2000]
    return output


def _check_rate_limit(session_id: str) -> bool:
    now = time.time()
    window = 60.0
    max_requests = 30
    if session_id not in _rate_limit_store:
        _rate_limit_store[session_id] = []
    timestamps = _rate_limit_store[session_id]
    timestamps = [t for t in timestamps if now - t < window]
    _rate_limit_store[session_id] = timestamps
    if len(timestamps) >= max_requests:
        return False
    timestamps.append(now)
    return True


@router.post("/chat")
async def chat(req: ChatRequest):
    if not _check_rate_limit(req.session_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait before sending another message.")

    append_message(req.session_id, "user", req.message)

    history = get_history(req.session_id) or []
    history_messages = []
    for msg in history:
        if msg["role"] == "user":
            history_messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            history_messages.append(AIMessage(content=msg["content"]))
    history_messages.append(HumanMessage(content=req.message))

    initial_state = {
        "messages": history_messages,
        "birth_details": req.birth_details.model_dump() if req.birth_details else None,
        "natal_chart": None,
        "intent": None,
        "tool_outputs": [],
        "session_id": req.session_id,
        "step_count": 0,
        "language": req.language or "en",
    }

    def _safe_json(obj: object) -> str:
        try:
            return json.dumps(obj, default=str)
        except Exception:
            return json.dumps({"type": "error", "message": "Serialization error"})

    async def event_generator():
        final_content = ""
        try:
            async for event in agent_graph.astream_events(initial_state, version="v2"):
                kind = event.get("event", "")
                tags = event.get("tags", [])
                if kind == "on_chat_model_stream" and "reasoner" in tags:
                    chunk = event.get("data", {}).get("chunk", None)
                    if chunk and hasattr(chunk, "content") and chunk.content:
                        token = chunk.content
                        final_content += token
                        yield {"event": "token", "data": _safe_json({"type": "token", "content": token})}
                elif kind == "on_tool_start":
                    tool_name = event.get("name", "unknown")
                    tool_input = event.get("data", {}).get("input", {})
                    yield {
                        "event": "tool_start",
                        "data": _safe_json({"type": "tool_start", "tool": tool_name, "input": tool_input}),
                    }
                elif kind == "on_tool_end":
                    tool_name = event.get("name", "unknown")
                    raw_output = event.get("data", {}).get("output", "")
                    tool_output = _serialize_tool_output(raw_output)
                    yield {
                        "event": "tool_end",
                        "data": _safe_json({"type": "tool_end", "tool": tool_name, "output": tool_output}),
                    }

            if final_content:
                append_message(req.session_id, "assistant", final_content)
            yield {"event": "done", "data": _safe_json({"type": "done"})}
        except Exception as e:
            logger.exception("Chat stream error")
            yield {
                "event": "error",
                "data": _safe_json({"type": "error", "message": f"I encountered a cosmic disturbance: {str(e)}"}),
            }

    return EventSourceResponse(event_generator())


@router.post("/sessions", response_model=CreateSessionResponse)
async def new_session():
    session_id = str(uuid.uuid4())
    create_session(session_id)
    return CreateSessionResponse(session_id=session_id)


@router.get("/sessions/{session_id}/history", response_model=SessionHistoryResponse)
async def session_history(session_id: str):
    messages = get_history(session_id)
    if messages is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionHistoryResponse(session_id=session_id, messages=messages)


@router.get("/health", response_model=HealthResponse)
async def health():
    import ephem
    try:
        s = ephem.Sun()
        s.compute()
        ephemeris_status = "loaded"
    except Exception:
        ephemeris_status = "error"
    return HealthResponse(status="ok", ephemeris=ephemeris_status)


@router.post("/geocode", response_model=GeocodeResponse)
async def geocode_endpoint(req: GeocodeRequest):
    """Validate a place name resolves to a real location."""
    try:
        result = geocode_place.invoke({"place_name": req.place})
        return GeocodeResponse(
            place=result.get("place"),
            lat=result.get("lat"),
            lon=result.get("lon"),
            timezone=result.get("timezone"),
            error=result.get("error"),
        )
    except Exception as e:
        return GeocodeResponse(place=req.place, error=str(e))


@router.post("/chart")
async def compute_birth_chart_endpoint(req: ChartRequest):
    lat, lon, tz = req.lat, req.lon, req.timezone
    if (lat is None or lon is None or tz is None) and req.place:
        try:
            geo = geocode_place.invoke({"place_name": req.place})
            lat = lat or geo.get("lat", 20.0)
            lon = lon or geo.get("lon", 78.0)
            tz = tz or geo.get("timezone", "Asia/Kolkata")
        except Exception:
            lat = lat or 20.0
            lon = lon or 78.0
            tz = tz or "Asia/Kolkata"
    elif lat is None or lon is None:
        lat = 20.0
        lon = 78.0
        tz = tz or "Asia/Kolkata"
    else:
        tz = tz or "UTC"
    result = compute_birth_chart.invoke({
        "date": req.date,
        "time": req.time,
        "lat": lat,
        "lon": lon,
        "timezone_str": tz,
    })
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return ChartResponse(**result)


@router.post("/transits")
async def get_transits_endpoint(req: TransitsRequest):
    from datetime import date as dt_date
    date_str = req.date or dt_date.today().isoformat()
    result = get_daily_transits.invoke({
        "date": date_str,
        "natal_chart": req.natal_chart,
    })
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return TransitsResponse(**result)


GUIDANCE_TEMPLATES = {
    "overall_templates": [
        "The {sun_sign} Sun aligns with {moon_sign} Moon, creating a harmonious flow between your identity and emotions today. This is a day for authentic expression guided by your deepest feelings. Trust the synchronicities.",
        "Today brings a focus on {sun_sign} energy — confident, creative, and alive. The Moon in {moon_sign} adds emotional depth to your interactions. Balance heart and mind in all decisions.",
        "A day of clarity as the Sun in {sun_sign} illuminates your path. With the Moon in {moon_sign}, your intuition is sharp. Pay attention to dreams and subtle signs throughout the day.",
    ],
    "career_templates": [
        "Mercury's position supports clear communication in professional matters. This is an excellent time for presentations, negotiations, and sharing your ideas with confidence. Your analytical mind is your greatest asset.",
        "Professional growth is highlighted. The current planetary alignment favors strategic planning and long-term career moves. Network with intention and trust your expertise.",
        "Your career sector is activated by beneficial aspects. Opportunities for recognition are present — step forward and claim them. Your hard work is being noticed at the highest levels.",
    ],
    "relationships_templates": [
        "Venus influences your relationship sector today, bringing warmth and harmony to interactions. Existing bonds deepen, and new connections feel fated. Practice active listening.",
        "Relationships require honest communication today. Mars energy encourages directness, but Saturn asks for patience. Find the middle ground between speaking your truth and honoring others.",
        "The cosmos supports heartfelt conversations. Share what you truly feel with those you love. Vulnerability is not weakness — it is the bridge to deeper connection and understanding.",
    ],
    "wellness_templates": [
        "The Moon's phase supports renewal and restoration. Focus on gentle movement, hydration, and foods that ground you. Your emotional and physical bodies are deeply connected today.",
        "Energy levels are balanced — not too high, not too low. This is an ideal day for establishing or recommitting to a wellness routine. Small consistent steps create lasting transformation.",
        "Your vitality is strong today. Channel this energy into activities that nourish both body and soul. Time in nature will be especially healing and centering.",
    ],
}

LUCKY_COLORS = [
    "Sapphire Blue", "Emerald Green", "Amber Gold", "Rose Quartz",
    "Lavender Mist", "Crimson Red", "Ocean Teal", "Moonlight Silver",
]

AFFIRMATIONS = [
    "I trust the wisdom of my heart and the clarity of my mind. The universe guides my every step.",
    "I am aligned with my highest purpose. Every challenge is an opportunity for growth and transformation.",
    "I radiate confidence, compassion, and creative power. My light illuminates the path for others.",
    "I release what no longer serves me and welcome abundance in all forms. The cosmos supports my journey.",
    "I am exactly where I need to be. Trusting the timing of my life brings peace and clarity.",
]

MANTRAS = [
    "Om Namah Shivaya — I honor the divine within",
    "Om Shanti Shanti Shanti — Peace in body, mind, and spirit",
    "So Hum — I am that, I am one with the universe",
    "Om Gam Ganapataye Namaha — I remove all obstacles",
    "Lokah Samastah Sukhino Bhavantu — May all beings be happy",
]


def _rating_from_aspects(aspects: list[dict]) -> int:
    positive = sum(1 for a in aspects if a.get("aspect") in ("trine", "sextile"))
    challenging = sum(1 for a in aspects if a.get("aspect") in ("square", "opposition"))
    base = 3
    if positive > challenging: base += 1
    if positive > challenging + 1: base += 1
    if challenging > positive: base -= 1
    if challenging > positive + 1: base -= 1
    return max(1, min(5, base))


@router.post("/daily-guidance")
async def daily_guidance(req: TransitsRequest):
    import random, math
    from datetime import date as dt_date
    date_str = req.date or dt_date.today().isoformat()

    transit_result = get_daily_transits.invoke({
        "date": date_str,
        "natal_chart": req.natal_chart,
    })
    if "error" in transit_result:
        raise HTTPException(status_code=400, detail=transit_result["error"])

    planets = transit_result.get("transiting_planets", [])
    moon_phase = transit_result.get("moon_phase", {})
    aspects = transit_result.get("aspects_to_natal", [])

    sun_sign = "Unknown"
    moon_sign = "Unknown"
    for p in planets:
        if p["name"] == "Sun":
            sun_sign = p.get("sign", "Unknown")
        if p["name"] == "Moon":
            moon_sign = p.get("sign", "Unknown")

    rating = _rating_from_aspects(aspects)
    career_rating = max(1, min(5, rating + random.choice([-1, 0, 0, 1])))
    rel_rating = max(1, min(5, rating + random.choice([-1, 0, 0, 1])))
    wellness_rating = max(1, min(5, rating + random.choice([-1, 0, 0, 1])))

    seed = sum(ord(c) for c in date_str + sun_sign + moon_sign)
    rng = random.Random(seed)

    overall_t = GUIDANCE_TEMPLATES["overall_templates"][rng.randint(0, len(GUIDANCE_TEMPLATES["overall_templates"]) - 1)].format(sun_sign=sun_sign, moon_sign=moon_sign)
    career_t = GUIDANCE_TEMPLATES["career_templates"][rng.randint(0, len(GUIDANCE_TEMPLATES["career_templates"]) - 1)]
    rel_t = GUIDANCE_TEMPLATES["relationships_templates"][rng.randint(0, len(GUIDANCE_TEMPLATES["relationships_templates"]) - 1)]
    wellness_t = GUIDANCE_TEMPLATES["wellness_templates"][rng.randint(0, len(GUIDANCE_TEMPLATES["wellness_templates"]) - 1)]

    return DailyGuidanceResponse(
        date=date_str,
        sun_sign=sun_sign,
        moon_sign=moon_sign,
        overall=GuidanceSectionSchema(rating=rating, summary=overall_t[:80] + "...", detail=overall_t),
        career=GuidanceSectionSchema(rating=career_rating, summary=career_t[:80] + "...", detail=career_t),
        relationships=GuidanceSectionSchema(rating=rel_rating, summary=rel_t[:80] + "...", detail=rel_t),
        wellness=GuidanceSectionSchema(rating=wellness_rating, summary=wellness_t[:80] + "...", detail=wellness_t),
        lucky_number=rng.randint(1, 99),
        lucky_color=rng.choice(LUCKY_COLORS),
        affirmation=rng.choice(AFFIRMATIONS),
        mantra=rng.choice(MANTRAS),
        moon_phase=moon_phase,
    )


@router.get("/cosmic-events")
async def cosmic_events():
    import ephem, math
    from datetime import datetime, timedelta, date as dt_date

    today = dt_date.today()
    events = []
    event_id = 0

    def _next_new_moon(from_date: dt_date) -> dt_date:
        d = from_date
        for _ in range(60):
            obs = ephem.Observer()
            obs.date = d.strftime("%Y/%m/%d") + " 12:00:00"
            m = ephem.Moon()
            s = ephem.Sun()
            m.compute(obs)
            s.compute(obs)
            ml = math.degrees(float(ephem.Ecliptic(m).lon))
            sl = math.degrees(float(ephem.Ecliptic(s).lon))
            diff = (ml - sl) % 360
            if diff < 12:
                return d
            d += timedelta(days=1)
        return from_date + timedelta(days=29)

    def _next_full_moon(from_date: dt_date) -> dt_date:
        d = from_date
        for _ in range(60):
            obs = ephem.Observer()
            obs.date = d.strftime("%Y/%m/%d") + " 12:00:00"
            m = ephem.Moon()
            s = ephem.Sun()
            m.compute(obs)
            s.compute(obs)
            ml = math.degrees(float(ephem.Ecliptic(m).lon))
            sl = math.degrees(float(ephem.Ecliptic(s).lon))
            diff = (ml - sl) % 360
            if 170 < diff < 190:
                return d
            d += timedelta(days=1)
        return from_date + timedelta(days=29)

    def _check_retrograde(planet_name: str, date: dt_date) -> bool:
        obs = ephem.Observer()
        obs.date = date.strftime("%Y/%m/%d") + " 12:00:00"
        cls_map = {
            "Mercury": ephem.Mercury, "Venus": ephem.Venus, "Mars": ephem.Mars,
            "Jupiter": ephem.Jupiter, "Saturn": ephem.Saturn,
            "Uranus": ephem.Uranus, "Neptune": ephem.Neptune, "Pluto": ephem.Pluto,
        }
        if planet_name not in cls_map:
            return False
        body = cls_map[planet_name]()
        body.compute(obs)
        return body.ra != body.ra

    nm = _next_new_moon(today)
    fm = _next_full_moon(today)

    event_id += 1
    events.append({
        "id": str(event_id),
        "type": "moon_phase",
        "title": "New Moon",
        "description": f"A powerful new moon for setting intentions and new beginnings. The sky is dark, inviting you to plant seeds for what you wish to grow.",
        "start_date": nm.isoformat() + "T12:00:00",
        "end_date": None,
        "significance": 4,
        "planets_involved": ["Moon", "Sun"],
        "icon": "🌑",
    })

    event_id += 1
    events.append({
        "id": str(event_id),
        "type": "moon_phase",
        "title": "Full Moon",
        "description": f"The full moon illuminates what has been hidden. A time of release, celebration, and emotional culmination.",
        "start_date": fm.isoformat() + "T18:00:00",
        "end_date": None,
        "significance": 4,
        "planets_involved": ["Moon", "Sun"],
        "icon": "🌕",
    })

    retro_checks = [("Mercury", "Communication, technology, and travel require extra patience."),
                    ("Venus", "Relationships and values come up for review. Old flames may reappear."),
                    ("Mars", "Channel frustration into focused action. Avoid impulsive decisions."),
                    ("Jupiter", "Revisit your beliefs and growth strategies. Inner expansion matters now."),
                    ("Saturn", "Karmic lessons intensify. Take responsibility for your boundaries."),
                    ("Uranus", "Expect the unexpected. Freedom comes through releasing control."),
                    ("Neptune", "Dreams and intuition are heightened. Beware of illusion and escapism."),
                    ("Pluto", "Deep transformation surfaces. Power dynamics demand honest examination.")]

    for planet_name, desc in retro_checks:
        if _check_retrograde(planet_name, today):
            event_id += 1
            end_d = today + timedelta(days=21 if planet_name in ("Mercury", "Venus") else 40)
            events.append({
                "id": str(event_id),
                "type": "retrograde",
                "title": f"{planet_name} Retrograde",
                "description": f"{planet_name} is traveling retrograde. {desc}",
                "start_date": today.isoformat() + "T00:00:00",
                "end_date": end_d.isoformat() + "T00:00:00",
                "significance": 4 if planet_name in ("Mercury", "Saturn") else 3,
                "planets_involved": [planet_name],
                "icon": "↩",
            })

    events.sort(key=lambda e: e["start_date"])

    return CosmicEventsResponse(events=events)
