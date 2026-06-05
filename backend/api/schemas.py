from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class BirthDetails(BaseModel):
    date: str | None = None
    time: str | None = None
    place: str | None = None
    lat: float | None = None
    lon: float | None = None
    timezone: str | None = None


class ChatRequest(BaseModel):
    session_id: str
    message: str
    birth_details: BirthDetails | None = None


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime


class SessionResponse(BaseModel):
    session_id: str
    created_at: datetime


class SessionHistoryResponse(BaseModel):
    session_id: str
    messages: list[MessageResponse]


class HealthResponse(BaseModel):
    status: str
    ephemeris: str


class CreateSessionResponse(BaseModel):
    session_id: str
