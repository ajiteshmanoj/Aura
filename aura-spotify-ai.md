# Aura — Real Spotify Data + AI Music Emotional Analysis

Read every file in the project first. I need two things: real Spotify data flowing into the app replacing all mock data, and AI-powered emotional analysis of the user's music using Claude.

---

## PART 1: Real Spotify Listening Data

The Spotify OAuth is already set up but the playlists page shows mock data. Make it use REAL data from my Spotify account.

### Fetching Real Data

1. After Spotify OAuth login, fetch the user's REAL recently played tracks:
   ```
   GET https://api.spotify.com/v1/me/player/recently-played?limit=50
   Headers: Authorization: Bearer {access_token}
   ```

2. Also fetch their current top tracks (medium term):
   ```
   GET https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50
   ```

3. Also fetch their top tracks short term (last 4 weeks) for more recent mood:
   ```
   GET https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50
   ```

4. For each track, try to fetch audio features:
   ```
   GET https://api.spotify.com/v1/audio-features?ids={comma_separated_ids}
   ```
   If this call fails (403 — Spotify deprecated this for newer apps), use this fallback:
   - Use the track's `popularity` score (0-100) as a proxy for mainstream energy
   - Fetch the artist's data including genres: `GET /v1/artists/{id}`
   - Use genre keywords to infer mood (e.g., "sad" genres = low valence, "dance"/"party" = high energy)
   - Store whatever data we can get

5. Store all fetched Spotify data in localStorage under keys like `spotify_recent_tracks`, `spotify_top_tracks`, `spotify_analysis_cache` with timestamps for cache invalidation.

### Displaying Real Data

6. Display REAL album art everywhere — use `track.album.images[0].url` (640px) for large displays and `track.album.images[2].url` (64px) for thumbnails. Replace ALL placeholder music note icons with actual album art throughout the entire app.

7. **Playlists page** — replace mock data entirely:
   - "Your light days" playlist: user's actual top tracks sorted by highest popularity, showing real album art, track name, artist
   - "Your comfort songs" playlist: tracks that appear multiple times in recently-played (most repeated = most comfort), or if no repeats, use the user's top tracks short-term
   - Each track row: real album art (rounded corners, 48px), track name in bold, artist name in secondary text
   - Playlist header: 2x2 mosaic grid of the top 4 tracks' album art as a collage
   - Add a "Play on Spotify" deep link button (opens spotify:track:{id} or https://open.spotify.com/track/{id})

8. **Express page** — song search with real data:
   - Search endpoint: `GET https://api.spotify.com/v1/search?q={query}&type=track&limit=8`
   - Each search result shows: real album art (48px rounded), track name, artist name
   - When user selects a song, display it as a beautiful selected card showing:
     - Large album art (120px, rounded 16px)
     - Track name in Playfair Display
     - Artist name in secondary text
     - A subtle glow effect behind the album art matching its dominant colour
     - An "×" button to deselect
   - Store the full track object with the check-in entry: id, name, artist, albumArt URL, spotifyUri

9. **Reflect page** — real listening data:
   - Show a horizontal scrollable row of recent track album art thumbnails (48px circles)
   - Below it: "You listened to {N} tracks this week" with the most active day highlighted
   - If audio features are available, show a smooth area chart of valence over time
   - If not available, show the AI analysis instead (Part 2)

---

## PART 2: AI-Powered Music Emotional Analysis

Use the Claude API to analyse the user's music listening patterns and generate emotional insights. This is the core AI feature of Aura.

### Create utility: src/utils/musicAnalysis.js

```javascript
const CACHE_KEY = 'aura_music_analysis';
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

export async function analyzeMusicMood(tracks, apiKey) {
  // Check cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < CACHE_DURATION) {
      return parsed.analysis;
    }
  }

  if (!apiKey) {
    return getMockAnalysis();
  }

  const trackList = tracks
    .slice(0, 30) // Send top 30 for analysis
    .map((t, i) => `${i + 1}. "${t.name}" by ${t.artist}${t.genres ? ` [${t.genres.join(', ')}]` : ''}`)
    .join('\n');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `You are Aura, an emotionally perceptive AI wellness companion that reads people's emotional state through their music choices. You speak like a warm, perceptive friend who deeply understands music — not a therapist or an app.

Here are the user's recently played and top tracks (most recent first):
${trackList}

Analyse their emotional state through their music. Respond in this EXACT JSON format and nothing else — no markdown, no backticks:

{
  "emotionalLandscape": "2-3 sentences about what emotional state this listening pattern suggests. Reference specific songs by name and what they might indicate about the person's mood. Be specific, not generic.",
  "pattern": "1-2 sentences about notable patterns — are they gravitating toward a particular mood, energy level, era, or emotional theme? What does the mix of genres/artists say?",
  "gentleObservation": "One warm, non-judgmental sentence that might resonate with them. Something they'd read and think 'yeah, that's exactly it.' Make it feel personal.",
  "moodScore": 0.65,
  "dominantEmotion": "reflective",
  "energyLevel": "moderate"
}

Rules:
- moodScore: 0.0 = very low/heavy, 1.0 = very bright/upbeat. Be honest based on the music.
- dominantEmotion: one word (e.g., "reflective", "anxious", "nostalgic", "energised", "melancholic", "hopeful", "restless", "peaceful")
- energyLevel: "low", "moderate", or "high"
- Never diagnose mental health conditions
- Never say "you seem depressed" or "you might be anxious"
- Reference actual song names to show you're paying attention
- Write like someone who LOVES music and gets why people listen to what they listen to`
        }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text;
    
    // Parse JSON from response
    const analysis = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());

    // Cache the result
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      analysis,
      timestamp: Date.now()
    }));

    return analysis;
  } catch (error) {
    console.error('Music analysis failed:', error);
    return getMockAnalysis();
  }
}

export async function analyzeSingleSong(trackName, artistName, apiKey) {
  if (!apiKey) {
    return "A meaningful choice — this song carries weight.";
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `You are Aura, a warm AI companion. The user just picked "${trackName}" by ${artistName} as their song of the day. Give a brief, warm, emotionally perceptive one-liner (max 15 words) about what this choice might say about how they're feeling right now. Don't be generic. Reference something specific about this song's mood, theme, or energy. Just the one-liner, no quotes, no explanation.`
        }]
      })
    });

    const data = await response.json();
    return data.content[0].text.trim();
  } catch (error) {
    return "A meaningful choice — this song carries weight.";
  }
}

function getMockAnalysis() {
  return {
    emotionalLandscape: "Your recent listening paints a picture of quiet introspection mixed with moments of warmth. Tracks like 'Vienna' and 'Golden Hour' suggest you're searching for beauty in the everyday, while 'Lovely Day' hints at a desire to find lightness even when things feel heavy.",
    pattern: "There's a clear gravitational pull toward acoustic and indie tracks with lyrical depth. You're choosing songs that feel like companions rather than background noise — music for thinking, not just filling silence.",
    gentleObservation: "It sounds like you're giving yourself permission to feel things fully right now, and that takes quiet courage.",
    moodScore: 0.58,
    dominantEmotion: "reflective",
    energyLevel: "moderate"
  };
}
```

### Where to Display the AI Analysis

#### 1. Reflect Page — "What your music says" card

Add a new prominent glassmorphism card in the Reflect page after the music section:

- Title: "What your music says" with a subtle ♪ icon in golden amber
- Show `emotionalLandscape` as the main body text (DM Sans, 15px)
- Show `pattern` as a secondary paragraph (slightly muted)
- Show `gentleObservation` in Playfair Display italic, 18px, with a golden amber left border accent — this should feel like the key takeaway
- Show `dominantEmotion` as a small pill/badge (e.g., "reflective" in a soft lavender pill)
- Show `moodScore` as a subtle horizontal gradient bar (red at 0 → amber at 0.5 → green at 1.0) with a dot indicator at the user's score
- Loading state: show a shimmer animation card with text "Reading your music..." while the API call is in progress
- The card should animate in with a fade-up when the analysis loads

#### 2. Express Page — Song Selection Insight

When the user selects their "song of the day" on the Express page:

- Call `analyzeSingleSong(trackName, artistName, apiKey)`
- Below the selected song card, show the AI one-liner in italic, secondary text colour
- Example: User picks "Fix You" by Coldplay → shows: *"Reaching for something healing — you might need to be gentle with yourself today."*
- This should fade in gently after a 1-second delay (feels like the AI is "thinking")
- If no API key, show the generic fallback

#### 3. Weekly Aura Report Enhancement

When generating the weekly Aura Report, include the Spotify data in the Claude prompt:

- Add the user's top 15 recently played tracks to the report prompt
- Add the music analysis results (emotionalLandscape, pattern, moodScore) to the prompt
- The report's "Music Insight" section should now reference REAL songs the user listened to, not generic observations
- This makes the report feel deeply personalised

#### 4. Echoes Page — Music-Matched Echoes

Enhance Echo matching with music data:

- If the user's current `moodScore` is below 0.4 (low mood music), prioritise showing Echoes tagged with "tough moments"
- If above 0.7, show more "recovery" tagged Echoes
- In each Echo card, if the person who wrote the Echo included a song recommendation, show a small album art thumbnail (use Spotify search to resolve it)

---

## PART 3: Visual Polish for Music Features

### Album Art Glow Effect
Wherever album art is displayed at 80px or larger, add a colour-extracted glow behind it:
```css
.album-art-glow {
  position: relative;
}
.album-art-glow::before {
  content: '';
  position: absolute;
  inset: -8px;
  background: inherit; /* Same album art */
  filter: blur(20px) saturate(1.5);
  opacity: 0.4;
  z-index: -1;
  border-radius: inherit;
}
```
Alternative if background inherit doesn't work: use a duplicate <img> behind the main one with blur and opacity applied.

### Music Mood Indicator
On the Reflect page, show the overall music mood as a beautiful ambient element:
- If `moodScore` > 0.7: warm golden glow in the ambient background
- If `moodScore` 0.4-0.7: soft neutral/lavender ambient
- If `moodScore` < 0.4: cool blue ambient
- This ties the music analysis back into the app's visual atmosphere

### Listening Stats Card
Add a small stats card on the Reflect page:
- "Tracks this week: {N}"
- "Most played artist: {artist name}"
- "Music mood: {dominantEmotion}" as a coloured pill
- Style as a compact glassmorphism card with subtle icons

---

## Fallback Behaviour

- **No Spotify connected**: Show "Connect Spotify to unlock music insights" with a green Spotify connect button. All music sections show this prompt instead of empty states.
- **No Claude API key**: Use the `getMockAnalysis()` function for all AI features. The app should still look complete and impressive.
- **Spotify connected but API call fails**: Cache aggressively. Show last successful data. Show a subtle "Updating..." indicator if retrying.
- **Both connected**: Full experience — real album art, real listening data, real AI analysis. This is the demo configuration.

---

## Environment Variables Needed

```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_ANTHROPIC_API_KEY=your_claude_api_key
```

Make sure the Spotify redirect URI in the code matches what's configured in the Spotify Developer Dashboard. It should be: `http://localhost:5173/callback` (or whatever port Vite runs on).

## Testing Checklist

After implementing, verify:
1. Spotify login flow works and redirects back to the app
2. Recently played tracks load with real album art
3. Top tracks load with real album art
4. Playlists page shows real data sorted correctly
5. Express page song search returns real Spotify results with album art
6. Selecting a song shows the AI one-liner insight
7. Reflect page shows the "What your music says" AI analysis card
8. Weekly report incorporates real Spotify data
9. All loading states show shimmer animations
10. Fallback to mock data works when APIs are unavailable
