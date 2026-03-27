const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
const REDIRECT_URI = 'http://127.0.0.1:3000/callback/spotify';
const SCOPES = 'user-read-recently-played user-top-read';

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/[+/=]/g, '').slice(0, 128);
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function initiateSpotifyAuth() {
  const verifier = generateCodeVerifier();
  localStorage.setItem('spotify_verifier', verifier);
  const challenge = await generateCodeChallenge(verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function handleSpotifyCallback(code) {
  const verifier = localStorage.getItem('spotify_verifier');
  if (!verifier) {
    console.error('Spotify: No code verifier found');
    return null;
  }
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  });
  const data = await res.json();
  if (data.error) {
    console.error('Spotify token error:', data.error, data.error_description);
    return null;
  }
  return data.access_token;
}

async function spotifyGet(token, url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) {
    localStorage.removeItem('aura_spotify_token');
    return null;
  }
  if (!res.ok) return null;
  return res.json();
}

export async function searchTracks(token, query) {
  if (!token) return [];
  const data = await spotifyGet(token, `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=8`);
  if (!data) return [];
  return (data.tracks?.items || []).map(mapTrack);
}

export async function getRecentlyPlayed(token) {
  if (!token) return [];
  const cached = getCachedData('spotify_recent_tracks');
  if (cached) return cached;

  const data = await spotifyGet(token, 'https://api.spotify.com/v1/me/player/recently-played?limit=50');
  if (!data) return [];

  const tracks = (data.items || []).map(item => ({
    ...mapTrack(item.track),
    playedAt: item.played_at,
  }));

  setCachedData('spotify_recent_tracks', tracks);
  return tracks;
}

export async function getTopTracks(token, timeRange = 'medium_term') {
  if (!token) return [];
  const cacheKey = `spotify_top_tracks_${timeRange}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const data = await spotifyGet(token, `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=50`);
  if (!data) return [];

  const tracks = (data.items || []).map(mapTrack);
  setCachedData(cacheKey, tracks);
  return tracks;
}

export async function getAudioFeatures(token, trackIds) {
  if (!token || !trackIds.length) return {};
  const ids = trackIds.slice(0, 100).join(',');
  const data = await spotifyGet(token, `https://api.spotify.com/v1/audio-features?ids=${ids}`);
  if (!data || !data.audio_features) return {};

  const features = {};
  for (const f of data.audio_features) {
    if (f) features[f.id] = { valence: f.valence, energy: f.energy, tempo: f.tempo, danceability: f.danceability, acousticness: f.acousticness, mode: f.mode };
  }
  return features;
}

export async function getArtistGenres(token, artistIds) {
  if (!token || !artistIds.length) return {};
  const unique = [...new Set(artistIds)].slice(0, 50);
  const data = await spotifyGet(token, `https://api.spotify.com/v1/artists?ids=${unique.join(',')}`);
  if (!data || !data.artists) return {};

  const genres = {};
  for (const a of data.artists) {
    if (a) genres[a.id] = a.genres || [];
  }
  return genres;
}

// Fetch all Spotify data and enrich with genres
export async function fetchAllSpotifyData(token) {
  if (!token) return null;

  const [recent, topMedium, topShort] = await Promise.all([
    getRecentlyPlayed(token),
    getTopTracks(token, 'medium_term'),
    getTopTracks(token, 'short_term'),
  ]);

  // Collect artist IDs for genre lookup
  const allTracks = [...recent, ...topMedium, ...topShort];
  const artistIds = allTracks.flatMap(t => t.artistIds || []);

  // Try audio features (may fail with 403 for newer apps)
  const trackIds = [...new Set(allTracks.map(t => t.id))];
  const [audioFeatures, genres] = await Promise.all([
    getAudioFeatures(token, trackIds).catch(() => ({})),
    getArtistGenres(token, artistIds).catch(() => ({})),
  ]);

  // Enrich tracks with genres and features
  const enrich = (tracks) => tracks.map(t => ({
    ...t,
    genres: (t.artistIds || []).flatMap(id => genres[id] || []),
    features: audioFeatures[t.id] || null,
  }));

  const result = {
    recent: enrich(recent),
    topMedium: enrich(topMedium),
    topShort: enrich(topShort),
    timestamp: Date.now(),
  };

  localStorage.setItem('spotify_all_data', JSON.stringify(result));
  return result;
}

export function getCachedSpotifyData() {
  try {
    const raw = localStorage.getItem('spotify_all_data');
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Cache valid for 30 minutes
    if (Date.now() - data.timestamp > 30 * 60 * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

function mapTrack(t) {
  return {
    id: t.id,
    name: t.name,
    artist: t.artists.map(a => a.name).join(', '),
    artistIds: t.artists.map(a => a.id),
    albumArt: t.album?.images?.[0]?.url || '',
    albumArtSmall: t.album?.images?.[2]?.url || t.album?.images?.[0]?.url || '',
    uri: t.uri,
    popularity: t.popularity || 0,
    externalUrl: t.external_urls?.spotify || '',
  };
}

function getCachedData(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > 15 * 60 * 1000) return null; // 15 min cache
    return data;
  } catch {
    return null;
  }
}

function setCachedData(key, data) {
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
}

// Mock audio features fallback
export function generateMockAudioFeatures(trackId) {
  const seed = trackId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const pseudoRandom = (offset) => ((seed + offset) * 9301 + 49297) % 233280 / 233280;
  return {
    valence: pseudoRandom(1) * 0.7 + 0.1,
    energy: pseudoRandom(2) * 0.7 + 0.15,
    tempo: 60 + pseudoRandom(3) * 120,
    danceability: pseudoRandom(4) * 0.6 + 0.2,
    acousticness: pseudoRandom(5) * 0.8,
    mode: pseudoRandom(6) > 0.5 ? 1 : 0,
  };
}
