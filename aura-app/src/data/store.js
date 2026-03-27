const STORAGE_KEY = 'aura_entries';
const SPOTIFY_TOKEN_KEY = 'aura_spotify_token';
const GOOGLE_TOKEN_KEY = 'aura_google_token';

export function getEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry) {
  const entries = getEntries();
  entries.push({ ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return entries;
}

export function setEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getSpotifyToken() {
  return localStorage.getItem(SPOTIFY_TOKEN_KEY);
}

export function setSpotifyToken(token) {
  localStorage.setItem(SPOTIFY_TOKEN_KEY, token);
}

export function getGoogleToken() {
  return localStorage.getItem(GOOGLE_TOKEN_KEY);
}

export function setGoogleToken(token) {
  localStorage.setItem(GOOGLE_TOKEN_KEY, token);
}

export function getEntriesForDateRange(startDate, endDate) {
  return getEntries().filter(e => {
    const d = new Date(e.timestamp);
    return d >= startDate && d <= endDate;
  });
}

export function getEntriesForWeek(weekOffset = 0) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - start.getDay() - (weekOffset * 7));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return getEntriesForDateRange(start, end);
}

export function getStreakInfo() {
  const entries = getEntries();
  const days = new Set(entries.map(e => new Date(e.timestamp).toDateString()));
  return { totalDays: days.size };
}
