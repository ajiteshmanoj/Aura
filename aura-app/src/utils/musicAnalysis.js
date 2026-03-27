const CACHE_KEY = 'aura_music_analysis';
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

export async function analyzeMusicMood(tracks, apiKey) {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < CACHE_DURATION) {
      return parsed.analysis;
    }
  }

  if (!apiKey) return getMockAnalysis();

  const trackList = tracks
    .slice(0, 30)
    .map((t, i) => `${i + 1}. "${t.name}" by ${t.artist}${t.genres ? ` [${t.genres.join(', ')}]` : ''}`)
    .join('\n');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
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
- Write like someone who LOVES music and gets why people listen to what they listen to`,
        }],
      }),
    });

    const data = await response.json();
    const text = data.content[0].text;
    const analysis = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim());

    localStorage.setItem(CACHE_KEY, JSON.stringify({ analysis, timestamp: Date.now() }));
    return analysis;
  } catch (error) {
    console.error('Music analysis failed:', error);
    return getMockAnalysis();
  }
}

export async function analyzeSingleSong(trackName, artistName, apiKey) {
  if (!apiKey) return "A meaningful choice — this song carries weight.";

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `You are Aura, a warm AI companion. The user just picked "${trackName}" by ${artistName} as their song of the day. Give a brief, warm, emotionally perceptive one-liner (max 15 words) about what this choice might say about how they're feeling right now. Don't be generic. Reference something specific about this song's mood, theme, or energy. Just the one-liner, no quotes, no explanation.`,
        }],
      }),
    });

    const data = await response.json();
    return data.content[0].text.trim();
  } catch {
    return "A meaningful choice — this song carries weight.";
  }
}

export function getMockAnalysis() {
  return {
    emotionalLandscape: "Your recent listening paints a picture of quiet introspection mixed with moments of warmth. Tracks like 'Vienna' and 'Golden Hour' suggest you're searching for beauty in the everyday, while 'Lovely Day' hints at a desire to find lightness even when things feel heavy.",
    pattern: "There's a clear gravitational pull toward acoustic and indie tracks with lyrical depth. You're choosing songs that feel like companions rather than background noise — music for thinking, not just filling silence.",
    gentleObservation: "It sounds like you're giving yourself permission to feel things fully right now, and that takes quiet courage.",
    moodScore: 0.58,
    dominantEmotion: "reflective",
    energyLevel: "moderate",
  };
}
