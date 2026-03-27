import { getEntries } from '../data/store';
import { getCachedSpotifyData } from './spotify';
import { getMockCalendarDensity } from './calendar';

export function assembleAuraContext() {
  const allEntries = getEntries();
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const entries = allEntries
    .filter(e => new Date(e.timestamp) >= twoWeeksAgo)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const spotifyData = getCachedSpotifyData();
  const recentTracks = spotifyData?.recent || [];
  const musicAnalysis = (() => {
    try {
      const raw = localStorage.getItem('aura_music_analysis');
      return raw ? JSON.parse(raw).analysis : null;
    } catch { return null; }
  })();

  const calendarDensity = getMockCalendarDensity();
  const knownTriggers = (() => {
    try {
      return JSON.parse(localStorage.getItem('aura_known_triggers') || '[]');
    } catch { return []; }
  })();

  const historicalSummaries = (() => {
    try {
      return JSON.parse(localStorage.getItem('aura_weekly_summaries') || '[]');
    } catch { return []; }
  })();

  const now = new Date();
  const timeContext = {
    date: now.toISOString().split('T')[0],
    dayOfWeek: now.toLocaleDateString('en', { weekday: 'long' }),
    timeOfDay: now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening',
    isWeekend: [0, 6].includes(now.getDay()),
  };

  // Build mock upcoming calendar from density data
  const upcomingCalendar = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    const density = calendarDensity[key];
    upcomingCalendar.push({
      date: key,
      dayOfWeek: d.toLocaleDateString('en', { weekday: 'long' }),
      events: density ? Array.from({ length: density.eventCount }, (_, j) => ({
        summary: `Event ${j + 1}`,
        startTime: '09:00',
        endTime: '10:00',
      })) : [],
    });
  }

  const pastCalendar = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const density = calendarDensity[key];
    pastCalendar.push({
      date: key,
      dayOfWeek: d.toLocaleDateString('en', { weekday: 'long' }),
      events: density ? Array.from({ length: density.eventCount }, (_, j) => ({
        summary: `Event ${j + 1}`,
      })) : [],
    });
  }

  return {
    entries,
    pastCalendar,
    upcomingCalendar,
    recentTracks,
    musicAnalysis,
    historicalSummaries,
    knownTriggers,
    timeContext,
  };
}

export function formatContextForAI(context) {
  let s = `CURRENT: ${context.timeContext.dayOfWeek}, ${context.timeContext.date}, ${context.timeContext.timeOfDay}\n\n`;

  if (context.entries.length > 0) {
    s += `RECENT CHECK-INS (last 14 days):\n`;
    context.entries.forEach(e => {
      s += `- ${new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}: colour=${e.colour || 'none'}`;
      if (e.metaphor) s += `, metaphor="${e.metaphor}"`;
      if (e.songName) s += `, song="${e.songName}" by ${e.songArtist}`;
      if (e.freeformText) s += `, journal="${e.freeformText.substring(0, 150)}"`;
      if (e.calendarDensity) s += `, events=${e.calendarDensity.eventCount}`;
      s += '\n';
    });
    s += '\n';
  }

  if (context.upcomingCalendar.some(d => d.events.length > 0)) {
    s += `UPCOMING 7 DAYS:\n`;
    context.upcomingCalendar.forEach(day => {
      s += `- ${day.date} (${day.dayOfWeek}): ${day.events.length} events\n`;
    });
    s += '\n';
  }

  if (context.recentTracks?.length > 0) {
    s += `RECENT SPOTIFY:\n`;
    context.recentTracks.slice(0, 15).forEach(t => {
      s += `- ${t.name} by ${t.artist}\n`;
    });
    s += '\n';
  }

  if (context.musicAnalysis) {
    s += `MUSIC MOOD: ${context.musicAnalysis.dominantEmotion}, score ${context.musicAnalysis.moodScore}/1.0\n\n`;
  }

  if (context.knownTriggers?.length > 0) {
    s += `KNOWN TRIGGERS:\n`;
    context.knownTriggers.forEach(t => {
      s += `- ${t.event}: ${t.effect} (${t.occurrences}x)\n`;
    });
    s += '\n';
  }

  return s;
}
