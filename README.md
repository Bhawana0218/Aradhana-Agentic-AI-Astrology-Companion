# ✨ AstroAgent — Agentic AI Astrology Companion

> **Aradhana** — A production-quality, multi-language AI astrology guide powered by LangGraph, real Swiss Ephemeris calculations, and a streaming React frontend. Built for scale — designed for India and the world.

[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue)](https://python.org)
[![React 18](https://img.shields.io/badge/React-18-61dafb)](https://react.dev)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2-green)](https://langchain-ai.github.io/langgraph/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-teal)](https://fastapi.tiangolo.com)

---

## What It Is

AstroAgent is an agentic AI companion that acts as **Aradhana**, a warm, spiritually grounded astrologer. It can:

- 🔭 **Compute real birth charts** using pyswisseph (Swiss Ephemeris) — Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto — with house cusps via Placidus
- 🌙 **Calculate daily transits** and aspects to your natal chart
- 📚 **Answer astrology questions** from a FAISS RAG knowledge base (15 reference docs)
- 🛡️ **Gracefully decline** off-topic, medical, legal, and financial requests
- 🌐 **Support 10 Indian languages** — English, Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi
- ⚡ **Stream responses** token-by-token via Server-Sent Events

---

## Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.11+ |
| Node.js | 18+ |
| OpenAI API Key | Any |
| OS | Windows / macOS / Linux |

---

## Setup — 5 Steps

### 1. Clone and enter the project
```bash
git clone <repo-url> astroagent
cd astroagent
```

### 2. Create Python virtual environment
```bash
cd backend
python -m venv venv

# macOS/Linux:
source venv/bin/activate
# Windows (CMD):
venv\Scripts\activate.bat
# Windows (PowerShell):
venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

### 3. Configure your environment
```bash
cp .env.example .env
# Open .env and set:
#   OPENAI_API_KEY=sk-your-key-here
```

### 4. Build the RAG knowledge base
```bash
# From project root (with venv active):
python -m backend.rag.build_index
# Expected output: "Index built: N chunks saved to rag/faiss_index/"
```

### 5. Install frontend dependencies
```bash
cd ../frontend
npm install
```

---

## Run the Application

### Backend (Terminal 1)
```bash
cd backend
# Activate venv first, then:
uvicorn backend.main:app --reload --port 8000
```

### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

### Or with Docker Compose
```bash
# Copy .env to project root
cp backend/.env .env

# Start both services:
docker compose up --build

# Open http://localhost:5173
```

---

## Run Evaluation

```bash
# From project root with venv active:
python eval/run_eval.py
```

This will:
1. Run all 30 golden-set test cases through the full agent
2. Apply deterministic checkers (tool calls, sun signs, safety guardrails)
3. Sample 10 cases for LLM-as-judge scoring
4. Print a scorecard table to stdout
5. Save scorecard to `eval/results/scorecard_YYYY-MM-DD.md`
6. Exit with code 1 if overall pass rate < 70%

---

## LangGraph Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AstroAgent Graph                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  User Message (POST /api/chat)                       │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                           │                                 │
│                    ┌──────▼───────┐                        │
│                    │   ROUTER     │  gpt-4o-mini            │
│                    │              │  • classify intent      │
│                    │              │  • extract birth details│
│                    └──────┬───────┘                        │
│                           │                                 │
│                    ┌──────▼───────┐                        │
│                    │  REASONER    │  gpt-4o + tools         │
│                    │              │  • Aradhana persona     │
│                    │              │  • safety guardrails    │
│                    └──────┬───────┘                        │
│                           │                                 │
│          ┌────────────────┴───────────────────┐            │
│          │ tool_calls?                         │            │
│         YES                                   NO           │
│          │                                    │            │
│   ┌──────▼────────┐                   ┌───────▼──────┐    │
│   │  TOOL NODE    │                   │   RESPOND    │    │
│   │  • geocode    │  ──loop──►        │   (safety    │    │
│   │  • birth chart│  (max 8)          │    check)    │    │
│   │  • transits   │                   └───────┬──────┘    │
│   │  • rag lookup │                           │            │
│   └───────────────┘                          END           │
└─────────────────────────────────────────────────────────────┘
```

**Nodes:**
- **ROUTER** — `gpt-4o-mini` classifies intent → `chart_request | daily_horoscope | free_question | off_topic`
- **REASONER** — `gpt-4o` with all 4 tools bound. Loops back through TOOL NODE until done or step budget exhausted
- **TOOL NODE** — LangGraph built-in `ToolNode` executes tool calls
- **RESPOND** — Applies safety checks, appends disclaimers if needed

---

## The 4 Tools

| Tool | Input | What it does |
|---|---|---|
| `geocode_place` | `place_name: str` | Resolves city name → `{lat, lon, timezone}` via Nominatim |
| `compute_birth_chart` | `date, time, lat, lon, timezone_str` | Real ephemeris via pyswisseph: all 10 planets, 12 houses (Placidus), ASC, MC |
| `get_daily_transits` | `date, natal_chart` | Today's planetary positions + aspects to natal planets |
| `knowledge_lookup` | `query: str` | FAISS semantic search over 15 astrology reference docs |

---

## Multi-Language Support

The frontend supports 10 languages. The UI placeholder text cycles through the selected language.
To have Aradhana *respond* in a specific language, include it in your message:
> "मेरी कुंडली के बारे में बताओ" (Aradhana will naturally respond in Hindi)

---

## Frontend Architecture

```
src/
├── App.tsx                   # QueryClient provider
├── components/
│   ├── ChatWindow.tsx        # Main layout, SSE streaming orchestration
│   ├── WelcomeScreen.tsx     # Animated welcome with suggested prompts
│   ├── MessageBubble.tsx     # User/AI bubbles with markdown rendering
│   ├── BirthDetailsForm.tsx  # Validated form (react-hook-form + zod)
│   ├── ToolActivityBadge.tsx # Live & historical tool execution badges
│   ├── StreamingIndicator.tsx # Three-dot typing animation
│   ├── ErrorBanner.tsx       # Dismissible error overlay
│   ├── LanguageSelector.tsx  # Dropdown for 10 Indian languages
│   └── CosmicBackground.tsx  # Canvas-based animated starfield
├── hooks/
│   ├── useChat.ts            # SSE streaming logic, event parsing
│   └── useSession.ts         # Session creation and history loading
├── store/
│   └── chatStore.ts          # Zustand store with localStorage persistence
├── types/
│   └── index.ts              # All shared TypeScript interfaces
└── styles/
    └── global.css            # Tailwind + custom cosmic design tokens
```

**Design System:**
- Deep space backgrounds (`#05070f`, `#0a0e1a`)
- Aurora purple (`#7b6ef6`) for AI/actions
- Solar gold (`#f4a236`) for user/CTA
- Cinzel display font for headers
- Cormorant Garamond for body copy
- Framer Motion for all animations
- Canvas-based starfield background

---

## Known Limitations

1. **pyswisseph accuracy**: For dates before ~1800 CE, ephemeris accuracy degrades due to Gregorian calendar transition
2. **Nominatim rate limiting**: Geocoding is limited to 1 request/second — not suitable for burst load
3. **Ascendant accuracy**: Requires accurate birth time; unknown birth times default to noon (affects houses but not planets)
4. **Historical timezones**: Historical timezone offsets may differ from modern ones; not accounted for
5. **RAG freshness**: Knowledge base is static (15 docs). Current transits use computed positions, not editorial content.
6. **Single OpenAI provider**: Swap via `OPENAI_BASE_URL` + `ROUTER_MODEL`/`REASONER_MODEL` env vars for OpenAI-compatible endpoints (Groq, Together, Azure)

---

## Stretch Goals Implemented

- [x] Real ephemeris computation (pyswisseph, not fake data)
- [x] LangGraph `astream_events` token streaming
- [x] Canvas-based animated cosmic background
- [x] Multi-language UI (10 Indian languages)
- [x] Persistent birth details (localStorage via Zustand)
- [x] Rate limiting (30 req/min per session, in-memory)
- [x] Safety guardrails with forbidden-phrase detection
- [x] LLM-as-judge evaluation harness
- [x] Docker Compose setup
- [x] Auto-resizing textarea input
- [x] Copy-to-clipboard for AI messages
- [x] Scroll-to-bottom button
- [x] Animated welcome screen with orbiting planets
- [x] Markdown rendering in AI messages (bold, italic, bullets)
- [x] Streaming cursor animation

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send message, receive SSE stream |
| `POST` | `/api/sessions` | Create new session |
| `GET` | `/api/sessions/{id}/history` | Load message history |
| `GET` | `/api/health` | Health check + ephemeris status |

**SSE Event Types:**
```json
{"type": "token", "content": "..."}
{"type": "tool_start", "tool": "compute_birth_chart", "input": {...}}
{"type": "tool_end", "tool": "compute_birth_chart", "output": {...}}
{"type": "done"}
{"type": "error", "message": "..."}
```
