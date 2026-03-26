# Aura — Claude Code Build Prompt

## What is Aura?

Aura is an AI-powered emotional wellness platform for university students. Instead of asking users to rate their mood on a 1-10 scale, Aura lets them **express** how they feel through creative, non-verbal modalities — colours, music, metaphors, photos, and freeform text. It then connects these expressions to the user's real-life schedule (via Google Calendar and Spotify) and uses AI to surface hidden patterns between their inner emotional world and their outer life demands.

The tagline: **"Express how you feel. See why you feel it. Know you're not alone."**

This is a prototype for a hackathon (Ground Zero 2026, NUS Entrepreneurship Society). The goal is a working, visually polished web app that can be demoed in a 2-minute video. **Visual polish matters enormously** — this is an emotional product and the UI needs to feel warm, beautiful, and human.

---

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **AI Engine:** Anthropic Claude API (claude-sonnet-4-20250514) for text analysis, metaphor interpretation, pattern surfacing, and generating Aura Reports
- **Spotify Integration:** Spotify Web API (OAuth 2.0 PKCE flow) for listening history and audio features
- **Calendar Integration:** Google Calendar API (OAuth 2.0) for schedule density analysis
- **Deployment:** Local dev for prototype demo (localhost)

---

## Design Direction

### Aesthetic
- **Tone:** Soft, warm, intimate. Think: a late-night journal meets a gallery exhibition. NOT clinical, NOT corporate wellness.
- **Colour palette:** Dark mode by default. Deep navy/charcoal backgrounds. Soft glowing accents — amber, lavender, soft coral. The user's own colour picks should feel like they're painting with light on a dark canvas.
- **Typography:** Use a distinctive, warm serif for headings (e.g., `Playfair Display` or `Lora`) paired with a clean sans-serif for body text (e.g., `DM Sans` or `Plus Jakarta Sans`). Import from Google Fonts.
- **Motion:** Subtle, fluid animations. Colour picks should have a soft glow/bloom effect. Page transitions should feel like gentle fades, not hard cuts. Echo cards should fade in softly. The Aura Canvas should feel generative and alive.
- **Spatial design:** Generous whitespace. Cards with soft rounded corners and subtle glassmorphism (frosted glass effect with backdrop-blur). Content should breathe.
- **Overall feel:** The user should feel like they're entering a calm, private, beautiful space — the opposite of a cluttered productivity app.

### Key UI Principle
On the worst days, the app should feel like a quiet room, not a demanding interface. The check-in should be possible in a single tap (just a colour). Depth and features are available but never forced.

---

## Core Features to Build

### 1. Express — The Check-In Screen

This is the heart of the app. A single screen where the user can express how they feel through multiple modalities. They can use one or all — no requirements.

#### 1a. Colour Picker
- A beautiful, full-spectrum colour wheel or gradient canvas (not a basic HTML colour input)
- The user drags/taps to select a colour that represents how they feel
- The selected colour should softly glow and fill a portion of the background, creating an ambient effect
- No labels like "happy = yellow" — the colour is purely personal and intuitive
- Store the hex value with each entry

#### 1b. Song of the Day (Spotify-Linked)
- Search bar that queries Spotify's search API
- Shows results with album art, track name, artist
- User selects a track → store the Spotify track ID
- After selection, fetch the track's audio features from Spotify API:
  - `valence` (0.0–1.0, musical happiness)
  - `energy` (0.0–1.0, intensity)
  - `tempo` (BPM)
  - `danceability`
  - `acousticness`
  - `mode` (major/minor key)
- Display a small visual indicator of the song's mood profile (e.g., a mini radar chart or simple mood tags like "low energy, melancholic, acoustic")

#### 1c. Metaphor / Analogy
- A text input with the prompt: *"Today I feel like..."*
- User completes the sentence (e.g., "...a phone on 2%", "...sunshine through a dirty window")
- This gets sent to Claude API for semantic/emotional analysis when generating insights

#### 1d. Freeform Text / Voice
- A text area for stream-of-consciousness writing
- Optional: voice recording button (use browser MediaRecorder API → transcribe with a speech-to-text approach, or just store as audio for the prototype)
- Prompt: *"Anything else on your mind? This is just for you."*

#### 1e. Photo
- Upload or capture a photo that represents their day
- Display as a polaroid-style card in their entry
- For the prototype, store as base64 or local blob

#### Submit / Save
- A gentle "Save this moment" button (not "Submit")
- Entry gets timestamped and stored (use localStorage or a simple JSON state for the prototype)
- After saving, show a soft confirmation animation and transition to the Reflect view

---

### 2. Listen — Passive Spotify Analysis

When the user connects Spotify:

#### 2a. Spotify OAuth
- Implement Spotify OAuth 2.0 PKCE flow (client-side, no backend needed)
- Scopes needed: `user-read-recently-played`, `user-top-read`
- Store access token in memory/sessionStorage

#### 2b. Daily Listening Mood Signature
- Fetch recently played tracks (GET /v1/me/player/recently-played, limit=50)
- For each track, fetch audio features (GET /v1/audio-features/{id})
  - NOTE: Spotify has deprecated the audio features endpoint as of November 2024. As a FALLBACK, simulate audio features with mock data for demo purposes, or use the track's metadata (popularity, explicit flag) and genre from the artist endpoint. **Document this clearly in the code and have a mock data layer ready.**
- Compute aggregate metrics for the day:
  - Average valence, energy, tempo, danceability, acousticness
  - Valence trend (morning vs evening if timestamps available)
  - Number of unique tracks vs repeat listens (high repeats = emotional processing signal)
- Display as a visual "Music Mood Signature" — a horizontal bar or wave showing the emotional energy of their listening throughout the day
- Use warm colours for high valence/energy, cool colours for low

#### 2c. Listening Shift Detection
- Compare today's listening signature to the user's 7-day and 30-day average
- If significant deviation detected (e.g., valence dropped 30%+), surface a gentle note:
  - *"Your listening has shifted noticeably in the last few days. No judgment — just something to notice."*

---

### 3. Reflect — AI Pattern Engine

#### 3a. Google Calendar Integration
- Implement Google Calendar OAuth 2.0 flow
- Scopes: `https://www.googleapis.com/auth/calendar.readonly`
- Fetch events for the current week and past 4 weeks
- Compute daily "busyness score": number of events, total hours scheduled, gaps between events
- Display as a calendar heatmap (darker = busier days)

#### 3b. Weekly Aura Report
- Generated every Sunday (or on-demand for the prototype)
- Send the week's data to Claude API with a carefully crafted prompt:
  - The user's daily colour picks (hex values)
  - Their metaphors/analogies for each day
  - Freeform text entries (summarised)
  - Spotify listening metrics (valence, energy averages per day)
  - Calendar density per day (number of events, hours booked)
- Claude should return:
  1. **Pattern observation** — connections between schedule density and emotional expression (e.g., "Your colours shifted cooler on days with 5+ scheduled events")
  2. **Music-mood correlation** — what their listening reveals (e.g., "Your song choices were notably lower-energy on Wednesday and Thursday, aligning with your busiest calendar days")
  3. **Metaphor trajectory** — thematic analysis of their analogies over the week (e.g., "Your metaphors moved from movement-based to stillness-based, which can signal a shift from stress to fatigue")
  4. **A gentle, non-prescriptive reflection prompt** — something to think about, not advice (e.g., "You seem to recharge on days with open afternoons. What would it look like to protect one afternoon this coming week?")
- Display as a beautiful, card-based report with the colour palette of the week, song highlights, and the AI's narrative

**Claude API prompt template for the report:**

```
You are Aura, an emotionally intelligent wellness companion. You analyse patterns in a user's emotional expression, music listening, and schedule to help them understand themselves better.

Here is a user's data for the past week:

COLOUR PICKS (hex values by day):
{colour_data}

METAPHORS/ANALOGIES:
{metaphor_data}

FREEFORM JOURNAL ENTRIES:
{journal_data}

SPOTIFY LISTENING (daily averages):
{spotify_data}

CALENDAR DENSITY (events per day, hours booked):
{calendar_data}

Generate a weekly Aura Report with these sections:
1. PATTERN: One key connection you see between their schedule and their emotional expression. Be specific, reference actual data points. 2-3 sentences.
2. MUSIC INSIGHT: What their listening patterns reveal this week. Reference specific shifts in valence/energy. 2-3 sentences.
3. METAPHOR TRAJECTORY: Thematic analysis of how their analogies evolved through the week. 2-3 sentences.
4. REFLECTION: A gentle, non-prescriptive question or observation to sit with. 1-2 sentences.

Rules:
- Never diagnose. Never say "you seem depressed" or "you may have anxiety."
- Never give direct advice like "you should..." or "try to..."
- Be warm, observant, and specific. Reference their actual words and data.
- Write like a perceptive friend, not a therapist or an app.
- Keep the total response under 200 words.
```

#### 3c. Before & After Event Check-In
- When a significant calendar event is approaching (detected by duration > 1 hour, or keyword detection like "exam", "presentation", "interview", "deadline"):
  - Show a pre-event mini check-in: just a colour pick + optional one-line text
  - After the event's end time, prompt a post-event check-in: colour pick + "How did it go?"
- Over time, the AI compares pre vs post: "You tend to feel anxious before presentations but your post-check-ins are consistently lighter. The dread is usually worse than the reality."
- For the prototype: mock this with a few sample events and show the before/after comparison visually (two colour swatches side by side with the AI insight below)

#### 3d. Intervention Features (when trend is bad)
When the AI detects 3+ consecutive days of notably negative expression (low valence colours, heavy metaphors, low Spotify valence), surface these (not all at once — one per session):

- **Guided vent**: "Want to get some of it out? Nobody sees this but you." → text/voice input → AI simply acknowledges: "That sounds like a lot. Thanks for letting it out."
- **Zoom-out view**: Show the full timeline — "This is what your last 3 weeks look like." With lighter periods visible, reinforcing that heavy stretches pass.
- **Small reclaim**: "Tomorrow has [N] commitments. Pick one thing you'll do just for you — even 15 minutes." → Add to calendar as a protected block.
- **Self-reframe**: Pull from their own past data — "Three weeks ago, on a similarly busy day, you picked [warm colour] and [upbeat song]. Things shifted for you before."

---

### 4. Echoes — Anonymous Community

#### 4a. Echo Cards
- Pre-seed a database (JSON file) of 30-50 anonymous Echo entries, each containing:
  - A colour (hex)
  - A metaphor or short feeling description
  - A coping action (what helped them)
  - A time marker ("They felt lighter within a few days")
  - Tags for matching: calendar_density (high/medium/low), expression_valence (low/medium/high), context (exams, work, relationships, general)
- When the user completes a check-in with notably low expression, show 2-3 matched Echo cards below their entry
- Matching logic: find Echoes with similar calendar density AND similar expression valence
- Display as soft, glowing cards with the person's colour as an accent

#### 4b. Echo Contribution (Retrospective)
- When the AI detects that a user's expression has improved after a rough stretch (3+ days of improvement after 3+ days of low expression):
  - Prompt: "You've been feeling lighter recently after a tough stretch. Want to leave an Echo for someone going through something similar?"
  - Input: "What helped you?" (text, 1-2 sentences)
  - Their Echo gets added to the pool (anonymised — no identifiable data)

#### 4c. Echo Safety
- All Echoes (pre-seeded and user-contributed) must pass through a content filter
- Claude API check before any Echo is surfaced:
  - Must contain a coping element (not just venting)
  - No self-harm references
  - No identifying information
  - Forward-looking tone

---

### 5. Canvas — Monthly Emotional Artwork

#### 5a. Auto-Generation
- At the end of each month (or on-demand in the prototype), generate a visual "Aura Canvas"
- Input data: all colour picks from the month, top songs, strongest metaphors
- Generation approach: Use HTML Canvas API or SVG to create a generative art piece:
  - Background: blend/gradient of the month's colour picks (weighted by frequency)
  - Overlaid: abstract shapes (circles, flowing curves) whose size/position is influenced by the Spotify valence data
  - Text layer: 3-5 of the user's most evocative metaphors, rendered in a handwritten or serif font at varying opacities
  - Song titles woven subtly into the composition
- The result should look like a piece of abstract art — personal, beautiful, and meaningful
- Add a "Share" button that exports the Canvas as a PNG

#### 5b. Canvas Gallery
- A scrollable gallery of past monthly Canvases
- Tapping on a past Canvas shows a summary of that month's patterns

---

### 6. Comfort Playlist & Mood Playlists

#### 6a. Auto-Generated Playlists
- From the user's Spotify listening history + Aura check-in data, identify:
  - **"Your light days" playlist**: songs listened to on days with the highest expression valence (brightest colours, most positive metaphors, highest Spotify valence)
  - **"Your comfort songs" playlist**: songs listened to during transitions from bad to better stretches (the recovery soundtrack)
- Display as playlist cards with album art collage
- "Play on Spotify" button (deep link to Spotify with the track list, or use Spotify Web Playback SDK for in-app preview)

#### 6b. In-the-moment suggestion
- When the user checks in with a low expression, suggest: "Last time things felt heavy, these songs were playing when things started getting better for you:" → show 3-4 comfort songs with one-tap play

---

### 7. Inverted Streak
- Track "days you showed up for yourself" (days with at least one check-in)
- Display as a gentle counter, NOT a guilt-inducing consecutive streak
- When the user returns after a gap: "Welcome back. No pressure, no streak lost. How are you today?"
- Never send push notifications like "You haven't checked in!" — Aura waits patiently

---

## Data Architecture (Prototype)

For the hackathon prototype, use localStorage + React state. No backend needed.

```typescript
interface AuraEntry {
  id: string;
  timestamp: string; // ISO date
  colour: string; // hex
  songId?: string; // Spotify track ID
  songName?: string;
  songArtist?: string;
  songAlbumArt?: string;
  songFeatures?: {
    valence: number;
    energy: number;
    tempo: number;
    danceability: number;
    acousticness: number;
    mode: number; // 0 = minor, 1 = major
  };
  metaphor?: string;
  freeformText?: string;
  photoBase64?: string;
  calendarDensity?: {
    eventCount: number;
    hoursBooked: number;
  };
  isBeforeEvent?: boolean;
  isAfterEvent?: boolean;
  linkedEventName?: string;
}

interface SpotifyDailySignature {
  date: string;
  avgValence: number;
  avgEnergy: number;
  avgTempo: number;
  avgDanceability: number;
  avgAcousticness: number;
  trackCount: number;
  uniqueTracks: number;
  repeatListens: number;
  topTracks: Array<{name: string; artist: string; valence: number}>;
}

interface EchoCard {
  id: string;
  colour: string;
  feeling: string;
  copingAction: string;
  timeToRecovery: string;
  tags: {
    calendarDensity: 'high' | 'medium' | 'low';
    expressionValence: 'low' | 'medium' | 'high';
    context: string;
  };
}

interface WeeklyReport {
  weekStartDate: string;
  colourPalette: string[]; // hex values
  patternInsight: string;
  musicInsight: string;
  metaphorTrajectory: string;
  reflectionPrompt: string;
  topSongs: Array<{name: string; artist: string; albumArt: string}>;
}
```

---

## Page / Route Structure

1. **/** — Landing / Onboarding (connect Spotify + Google Calendar, brief intro)
2. **/express** — The main check-in screen (all modalities on one page)
3. **/reflect** — Dashboard showing:
   - Calendar heatmap
   - Spotify mood signature
   - Timeline of past entries (colour ribbon + metaphor snippets)
   - Before/After event comparisons
4. **/report** — Weekly Aura Report (AI-generated)
5. **/echoes** — Echo cards feed (matched to user's current/recent state)
6. **/canvas** — Monthly Canvas gallery + current month preview
7. **/playlists** — Comfort Playlist + Light Days playlist

Navigation: bottom tab bar (mobile-first design) with icons for Express, Reflect, Echoes, Canvas. Keep it to 4-5 tabs max.

---

## Pre-Seeded Demo Data

For the hackathon demo, pre-seed 2-3 weeks of mock user data so the AI reports and patterns have something to work with. Create a realistic scenario:

- **Week 1:** Moderate busyness, mixed colours (teals, ambers), upbeat songs, metaphors like "a boat on calm water"
- **Week 2:** Increasing busyness (exam prep), colours shift darker (greys, deep blues), songs shift to lower valence, metaphors become heavier ("running uphill", "drowning in deadlines")
- **Week 3:** Peak exam week, very high calendar density, darkest colours, lowest energy songs, heaviest metaphors. Then gradual recovery — colours lighten, songs shift upbeat, metaphors ease.

This arc lets the demo show:
- The pattern correlation in action (schedule density ↔ expression)
- The Spotify mood shift detection
- Echo cards appearing during the low point
- The Before/After check-in for an exam
- The recovery moment triggering an Echo contribution prompt
- A monthly Canvas that visually represents the full arc

---

## API Keys & Environment

```env
VITE_ANTHROPIC_API_KEY=your_claude_api_key
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Note: For the prototype demo, if Spotify audio features API is deprecated, use the mock data layer. The demo should work seamlessly regardless of API availability.

---

## Priority Order for Building

Build in this order so you always have a demoable state:

1. **Project setup** — Vite + React + Tailwind + routing + dark theme + fonts
2. **Express screen** — Colour picker + metaphor input + freeform text (core check-in without external APIs)
3. **Mock data seeding** — Pre-populate 2-3 weeks of entries so other screens have data
4. **Reflect dashboard** — Timeline view of entries + calendar heatmap (mock calendar data first)
5. **Spotify integration** — OAuth + search + song selection on Express screen + daily listening signature
6. **Google Calendar integration** — OAuth + event fetching + density computation
7. **Weekly Aura Report** — Claude API integration for pattern analysis
8. **Echo cards** — Pre-seeded database + matching logic + display
9. **Monthly Canvas** — Generative art from month's data
10. **Comfort Playlist** — Auto-generated from listening history analysis
11. **Before/After events** — Calendar event detection + mini check-ins
12. **Intervention features** — Guided vent, zoom-out, small reclaim
13. **Polish** — Animations, transitions, loading states, mobile responsiveness

---

## Critical Reminders

- **Mobile-first design.** The demo video will likely show this on a phone screen. Everything must look gorgeous at 390px width.
- **Dark mode is the default and only mode.** This is an intimate, nighttime-journal-feeling app.
- **Every interaction should feel gentle.** No harsh transitions, no aggressive CTAs, no red error states. Even error messages should be soft.
- **The AI should write like a perceptive friend, not a therapist or an app.** Warm, specific, never clinical.
- **Privacy by default.** Everything stays on-device for the prototype. No data leaves the browser except API calls to Claude/Spotify/Google.
- **When in doubt, cut scope, not polish.** A beautiful app with 3 features beats an ugly app with 10.
