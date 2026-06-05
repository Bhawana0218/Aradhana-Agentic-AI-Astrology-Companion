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

export type AIPersona = 'wise' | 'poetic' | 'direct' | 'nurturing';

export interface SuggestedPrompt {
  icon: string;
  text: string;
  category: 'chart' | 'transit' | 'question';
}

// ─────────────────────────────────────────────
// Daily Guidance
// ─────────────────────────────────────────────

export interface DailyGuidance {
  date: string;
  sun_sign: string;
  moon_sign: string;
  overall: GuidanceSection;
  career: GuidanceSection;
  relationships: GuidanceSection;
  wellness: GuidanceSection;
  lucky_number: number;
  lucky_color: string;
  affirmation: string;
  mantra: string;
  moon_phase?: { phase: string; illumination_pct: number };
}

export interface GuidanceSection {
  rating: number; // 1-5
  summary: string;
  detail: string;
}

// ─────────────────────────────────────────────
// Journal
// ─────────────────────────────────────────────

export type Mood = 'cosmic' | 'radiant' | 'calm' | 'stormy' | 'neutral';
export type JournalTag = 'reflection' | 'intention' | 'dream' | 'gratitude' | 'insight' | 'transit';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: Mood;
  tags: JournalTag[];
  created_at: string;
  updated_at: string;
  ai_reflection?: string;
  bookmarked: boolean;
}

// ─────────────────────────────────────────────
// Reading History
// ─────────────────────────────────────────────

export interface ReadingSession {
  id: string;
  title: string;
  preview: string;
  created_at: string;
  message_count: number;
  bookmarked: boolean;
  tags: string[];
}

// ─────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────

export interface UserProfile {
  name: string;
  email?: string;
  avatar?: string;
  birth_details: BirthDetails | null;
  preferences: UserPreferences;
  joined_at: string;
}

export interface UserPreferences {
  language: Language;
  theme: Theme;
  ai_persona: AIPersona;
  notifications: boolean;
  weekly_guidance: boolean;
  retrograde_alerts: boolean;
  eclipse_alerts: boolean;
}

// ─────────────────────────────────────────────
// Cosmic Events
// ─────────────────────────────────────────────

export type EventType = 'retrograde' | 'eclipse' | 'moon_phase' | 'planetary_alignment' | 'solstice' | 'equinox' | 'meteor_shower';

export interface CosmicEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  significance: number; // 1-5
  planets_involved?: string[];
  icon: string;
}

// ─────────────────────────────────────────────
// Learning Hub
// ─────────────────────────────────────────────

export interface ZodiacSignDetail {
  name: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  ruler: string;
  house: number;
  keywords: string[];
  description: string;
  strengths: string[];
  weaknesses: string[];
  color: string;
}

export interface HouseDetail {
  number: number;
  title: string;
  keywords: string[];
  description: string;
  ruled_sign: string;
}

export interface PlanetDetail {
  name: string;
  symbol: string;
  rules: string[];
  description: string;
  color: string;
  speed: string;
  retrograde_period: string;
  keywords: string[];
}

export interface NakshatraDetail {
  name: string;
  number: number;
  lord: string;
  symbol: string;
  deity: string;
  description: string;
  range: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

// ─────────────────────────────────────────────
// Notification / Toast
// ─────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
