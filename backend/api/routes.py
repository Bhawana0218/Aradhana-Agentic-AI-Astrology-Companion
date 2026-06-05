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
from .schemas import (
    ChatRequest,
    CreateSessionResponse,
    HealthResponse,
    SessionHistoryResponse,
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
