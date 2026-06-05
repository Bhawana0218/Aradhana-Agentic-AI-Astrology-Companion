from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class BirthDetails(BaseModel):
    name: str | None = None
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
    language: str = "en"


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


class ChartRequest(BaseModel):
    date: str
    time: str
    place: str | None = None
    lat: float | None = None
    lon: float | None = None
    timezone: str | None = None


class ChartResponse(BaseModel):
    planets: list[dict]
    houses: list[dict]
    ascendant: dict
    midheaven: dict


class TransitsRequest(BaseModel):
    date: str | None = None
    lat: float | None = None
    lon: float | None = None
    timezone: str | None = None
    natal_chart: dict | None = None


class TransitsResponse(BaseModel):
    transiting_planets: list[dict]
    moon_phase: dict
    aspects_to_natal: list[dict]
    date: str


class GuidanceSectionSchema(BaseModel):
    rating: int
    summary: str
    detail: str


class DailyGuidanceResponse(BaseModel):
    date: str
    sun_sign: str
    moon_sign: str
    overall: GuidanceSectionSchema
    career: GuidanceSectionSchema
    relationships: GuidanceSectionSchema
    wellness: GuidanceSectionSchema
    lucky_number: int
    lucky_color: str
    affirmation: str
    mantra: str
    moon_phase: dict


class CosmicEventSchema(BaseModel):
    id: str
    type: str
    title: str
    description: str
    start_date: str
    end_date: str | None = None
    significance: int
    planets_involved: list[str] = []
    icon: str


class CosmicEventsResponse(BaseModel):
    events: list[CosmicEventSchema]


class GeocodeRequest(BaseModel):
    place: str


class GeocodeResponse(BaseModel):
    place: str | None = None
    lat: float | None = None
    lon: float | None = None
    timezone: str | None = None
    error: str | None = None
