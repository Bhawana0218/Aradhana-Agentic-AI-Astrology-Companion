export const APP_NAME = 'Aradhana';
export const APP_TAGLINE = 'Your Cosmic Guide';
export const API_BASE = '/api';

export const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};

export const PLANET_COLORS: Record<string, string> = {
  Sun: '#f4a236', Moon: '#e8d5a3', Mercury: '#9d93f8',
  Venus: '#f9a8d4', Mars: '#fb7185', Jupiter: '#fbbf24',
  Saturn: '#d4a373', Uranus: '#7dd3fc', Neptune: '#818cf8', Pluto: '#c084fc',
};

export const SIGN_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

export const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export const FEATURES = [
  {
    icon: '☉',
    title: 'Real Birth Chart Analysis',
    desc: 'Precise planetary positions, houses, and aspects computed from live ephemeris data.',
  },
  {
    icon: '♃',
    title: 'Daily Planetary Transits',
    desc: 'Track today\'s cosmic movements and how they interact with your natal chart.',
  },
  {
    icon: '✦',
    title: 'AI Spiritual Companion',
    desc: 'A warm, wise guide for thoughtful conversation about your astrological journey.',
  },
  {
    icon: '☽',
    title: 'Personalized Insights',
    desc: 'Receive guidance tailored to your unique birth chart and life questions.',
  },
];

export const TOOL_DISPLAY: Record<string, { label: string; icon: string }> = {
  geocode_place: { label: 'Finding your birth location', icon: '🌍' },
  compute_birth_chart: { label: 'Computing planetary positions', icon: '⭐' },
  get_daily_transits: { label: 'Reading daily transits', icon: '🌙' },
  knowledge_lookup: { label: 'Consulting astrology knowledge', icon: '📖' },
};

export const MAX_STREAMING_ROWS = 5;
export const SAVE_DELAY_MS = 1200;
export const RATE_LIMIT_WINDOW_MS = 60000;
export const RATE_LIMIT_MAX = 30;
