// ─────────────────────────────────────────────
// Core domain types
// ─────────────────────────────────────────────

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tool_activity?: ToolActivity[];
  created_at?: string;
  isStreaming?: boolean;
}

export interface ToolActivity {
  type: 'tool_start' | 'tool_end';
  tool: string;
  input?: unknown;
  output?: unknown;
  timestamp?: number;
}

export interface ToolActivityState {
  tool: string;
  status: 'running' | 'done' | 'error';
  input?: unknown;
  output?: unknown;
  startedAt?: number;
}

export interface SSEEvent {
  type: 'token' | 'tool_start' | 'tool_end' | 'done' | 'error';
  content?: string;
  tool?: string;
  input?: unknown;
  output?: unknown;
  message?: string;
}

export interface BirthDetails {
  name?: string;
  date: string;
  time: string;
  place: string;
  lat?: number;
  lon?: number;
  timezone?: string;
}

// ─────────────────────────────────────────────
// API types
// ─────────────────────────────────────────────

export interface ChatRequest {
  session_id: string;
  message: string;
  birth_details?: BirthDetails;
}

export interface SessionResponse {
  session_id: string;
}

export interface MessageResponse {
  id: number;
  role: string;
  content: string;
  created_at: string;
}

export interface SessionHistoryResponse {
  session_id: string;
  messages: MessageResponse[];
}

export interface HealthResponse {
  status: string;
  ephemeris: string;
}

// ─────────────────────────────────────────────
// Chart types (from backend)
// ─────────────────────────────────────────────

export interface PlanetData {
  name: string;
  longitude: number;
  sign: string;
  degree: number;
  retrograde: boolean;
  speed: number;
}

export interface HouseData {
  house: number;
  cusp: number;
  sign: string;
  degree: number;
}

export interface ChartPoint {
  sign: string;
  degree: number;
  longitude: number;
}

export interface BirthChart {
  planets: PlanetData[];
  houses: HouseData[];
  ascendant: ChartPoint;
  midheaven: ChartPoint;
}

// ─────────────────────────────────────────────
// UI / i18n types
// ─────────────────────────────────────────────

export type Language = 'en' | 'hi' | 'bn' | 'te' | 'mr' | 'ta' | 'gu' | 'kn' | 'ml' | 'pa';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export type Theme = 'cosmic' | 'mystic' | 'celestial';

export interface SuggestedPrompt {
  icon: string;
  text: string;
  category: 'chart' | 'transit' | 'question';
}
