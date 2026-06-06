import type { DailyGuidance, CosmicEvent } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail ?? `Request failed (${res.status})`);
  }
  if (res.headers.get('content-type')?.includes('text/event-stream')) {
    return res as unknown as T;
  }
  return res.json();
}

export async function createSession(): Promise<{ session_id: string }> {
  return request('/sessions', { method: 'POST' });
}

export async function getSessionHistory(sessionId: string) {
  return request<{ session_id: string; messages: { id: number; role: string; content: string; created_at: string }[] }>(
    `/sessions/${sessionId}/history`
  );
}

export async function computeChart(params: {
  date: string; time: string; place: string; lat?: number | null; lon?: number | null; timezone?: string | null;
}) {
  return request('/chart', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function getTransits(params: { date?: string; lat?: number; lon?: number; timezone?: string; natal_chart?: unknown }) {
  return request('/transits', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export function chatStream(params: {
  session_id: string; message: string; birth_details?: unknown; language?: string;
}) {
  return fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function healthCheck() {
  return request<{ status: string; ephemeris: string }>('/health');
}

export async function geocodePlace(place: string) {
  return request<{ place?: string; lat?: number; lon?: number; timezone?: string; error?: string }>('/geocode', {
    method: 'POST',
    body: JSON.stringify({ place }),
  });
}

export async function getDailyGuidance(params: { date?: string; natal_chart?: unknown }): Promise<DailyGuidance> {
  const data = await request<{
    date: string; sun_sign: string; moon_sign: string;
    overall: { rating: number; summary: string; detail: string };
    career: { rating: number; summary: string; detail: string };
    relationships: { rating: number; summary: string; detail: string };
    wellness: { rating: number; summary: string; detail: string };
    lucky_number: number; lucky_color: string; affirmation: string; mantra: string;
    moon_phase: { phase: string; illumination_pct: number };
  }>('/daily-guidance', {
    method: 'POST',
    body: JSON.stringify(params),
  });

  return {
    date: data.date,
    sun_sign: data.sun_sign,
    moon_sign: data.moon_sign,
    overall: { rating: data.overall.rating, summary: data.overall.summary, detail: data.overall.detail },
    career: { rating: data.career.rating, summary: data.career.summary, detail: data.career.detail },
    relationships: { rating: data.relationships.rating, summary: data.relationships.summary, detail: data.relationships.detail },
    wellness: { rating: data.wellness.rating, summary: data.wellness.summary, detail: data.wellness.detail },
    lucky_number: data.lucky_number,
    lucky_color: data.lucky_color,
    affirmation: data.affirmation,
    mantra: data.mantra,
    moon_phase: data.moon_phase,
  };
}

export async function getCosmicEvents(): Promise<CosmicEvent[]> {
  const data = await request<{ events: CosmicEvent[] }>('/cosmic-events');
  return data.events;
}

export { ApiError };
