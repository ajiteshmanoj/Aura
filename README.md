# Aura

**Express how you feel. See why you feel it. Know you're not alone.**

Aura is an AI-powered emotional wellness platform for university students. Instead of rating moods on a scale, users express how they feel through colours, music, metaphors, photos, and freeform text. Aura then connects these expressions to real-life schedule data and uses AI to surface hidden patterns.

Built for **Ground Zero 2026** (NUS Entrepreneurship Society Hackathon).

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS v4
- **AI Engine:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Spotify:** OAuth 2.0 PKCE flow + Web API (with mock audio features fallback)
- **Google Calendar:** OAuth 2.0 implicit flow
- **Storage:** localStorage (prototype — no backend)

## What's Implemented

### Pages & Features

| Page | Route | Status | Description |
|------|-------|--------|-------------|
| Landing | `/` | Done | Animated onboarding, Spotify/Calendar connect buttons, auto-seeds demo data |
| Express | `/express` | Done | Full check-in screen with colour picker, song search, metaphor input, freeform text, photo upload |
| Reflect | `/reflect` | Done | Colour ribbon timeline, calendar heatmap, music mood signature chart, before/after event comparisons, entry timeline, inverted streak counter, intervention nudges |
| Report | `/report` | Done | AI-generated weekly Aura Report via Claude API (pattern, music insight, metaphor trajectory, reflection). Falls back to mock report if no API key |
| Echoes | `/echoes` | Done | 30 pre-seeded anonymous echo cards with matching logic, filter tabs (All/For You/Tough Moments/Recovery), Echo contribution flow |
| Canvas | `/canvas` | Done | Generative art from month's colour picks, metaphors, and songs using HTML Canvas API. Export as PNG. Gallery of past months |
| Playlists | `/playlists` | Done | Auto-generated "Light Days" and "Comfort Songs" playlists from listening history + valence data |

### Core Components

- **ColourPicker** — Full-spectrum HSL colour wheel with hue slider, glow preview, and ambient background effect
- **SongSearch** — Spotify track search with debounce, album art, mood tags from audio features (requires Spotify token)
- **NavBar** — Fixed bottom tab bar with Express, Reflect, Echoes, Canvas tabs

### Data & Integrations

- **Mock Data:** 3 weeks of pre-seeded entries (20 entries) showing a calm → exam stress → recovery arc
- **Spotify OAuth PKCE:** Full client-side flow with token exchange (needs `VITE_SPOTIFY_CLIENT_ID`)
- **Google Calendar OAuth:** Implicit flow for event fetching (needs `VITE_GOOGLE_CLIENT_ID`)
- **Mock Calendar Density:** Auto-generated 28-day busyness data for demo
- **Echo Cards:** 30 hand-written anonymous entries with feeling, coping action, recovery time, and matching tags

### Design

- Dark mode only — deep navy/charcoal backgrounds with amber, lavender, coral, and teal accents
- Glassmorphism cards with `backdrop-blur`
- Playfair Display (headings) + DM Sans (body) from Google Fonts
- Smooth fade-in/bloom animations with staggered children
- Mobile-first (optimized for 390px width)

## Getting Started

```bash
cd aura-app
npm install
npm run dev
```

The app runs at `http://localhost:5173` with pre-seeded demo data — no API keys needed for the basic demo.

### Optional: API Keys

Create `aura-app/.env`:

```env
VITE_ANTHROPIC_API_KEY=your_claude_api_key
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

- **Without keys:** Song search is disabled (shows placeholder), Aura Report uses mock insights, calendar uses mock data
- **With keys:** Full Spotify search, Claude-generated reports, Google Calendar integration

## Project Structure

```
aura-app/
  src/
    components/    # ColourPicker, NavBar, SongSearch
    pages/         # Landing, Express, Reflect, Report, Echoes, Canvas, Playlists
    data/          # store.js (localStorage), mockData.js, echoCards.js
    utils/         # colour.js, spotify.js, calendar.js
    App.jsx        # Routes and layout
    index.css      # Tailwind + custom animations
```
