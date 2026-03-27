import { callAI } from './ai';
import { assembleAuraContext, formatContextForAI } from './auraContext';

const CACHE_KEY = 'aura_music_analysis';
const CACHE_DURATION = 6 * 60 * 60 * 1000;

export async function analyzeMusicMood(tracks) {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < CACHE_DURATION) return parsed.analysis;
  }

  const context = assembleAuraContext();
  const contextStr = formatContextForAI(context);

  const trackList = tracks
    .slice(0, 30)
    .map((t, i) => `${i + 1}. "${t.name}" by ${t.artist}${t.genres?.length ? ` [${t.genres.join(', ')}]` : ''}`)
    .join('\n');

  const result = await callAI(
    `You are Aura, an emotionally perceptive AI wellness companion that reads people's emotional state through their music choices. You speak like a warm, perceptive friend who deeply understands music.`,
    `Here are the user's recently played and top tracks:\n${trackList}\n\nUser context:\n${contextStr}\n\nAnalyse their emotional state through their music. Connect music patterns to their calendar and check-in data where possible. Respond in this EXACT JSON format and nothing else:\n\n{"emotionalLandscape": "2-3 sentences referencing specific songs", "pattern": "1-2 sentences about patterns", "gentleObservation": "One warm sentence that resonates", "moodScore": 0.65, "dominantEmotion": "reflective", "energyLevel": "moderate"}\n\nRules: moodScore 0.0=heavy, 1.0=bright. dominantEmotion: one word. energyLevel: "low"/"moderate"/"high". Reference actual song names. No markdown.`,
    { maxTokens: 512, fallback: JSON.stringify(getMockAnalysis()) }
  );

  try {
    const analysis = JSON.parse((result || '').replace(/```json\n?|\n?```/g, '').trim());
    localStorage.setItem(CACHE_KEY, JSON.stringify({ analysis, timestamp: Date.now() }));
    return analysis;
  } catch {
    return getMockAnalysis();
  }
}

export async function analyzeSingleSong(trackName, artistName) {
  const result = await callAI(
    `You are Aura, a warm AI companion.`,
    `The user just picked "${trackName}" by ${artistName} as their song of the day. Give a brief, warm, emotionally perceptive one-liner (max 15 words) about what this choice might say about how they're feeling. Reference something specific about this song. Just the one-liner, no quotes.`,
    { maxTokens: 60, fallback: "A meaningful choice — this song carries weight." }
  );
  return result || "A meaningful choice — this song carries weight.";
}

export function getMockAnalysis() {
  return {
    emotionalLandscape: "Your recent listening paints a picture of quiet introspection mixed with moments of warmth. Tracks like 'Vienna' and 'Golden Hour' suggest you're searching for beauty in the everyday, while 'Lovely Day' hints at a desire to find lightness even when things feel heavy.",
    pattern: "There's a clear gravitational pull toward acoustic and indie tracks with lyrical depth. You're choosing songs that feel like companions rather than background noise.",
    gentleObservation: "It sounds like you're giving yourself permission to feel things fully right now, and that takes quiet courage.",
    moodScore: 0.58,
    dominantEmotion: "reflective",
    energyLevel: "moderate",
  };
}
