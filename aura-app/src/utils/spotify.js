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
    console.error('Spotify: No code verifier found in sessionStorage');
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

export async function searchTracks(token, query) {
  if (!token) return [];
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (res.status === 401) {
    // Token expired — clear it so user can reconnect
    localStorage.removeItem('aura_spotify_token');
    return [];
  }
  const data = await res.json();
  return (data.tracks?.items || []).map(t => ({
    id: t.id,
    name: t.name,
    artist: t.artists.map(a => a.name).join(', '),
    albumArt: t.album.images[0]?.url || '',
    uri: t.uri,
  }));
}

export async function getRecentlyPlayed(token) {
  if (!token) return [];
  const res = await fetch(
    'https://api.spotify.com/v1/me/player/recently-played?limit=50',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  return data.items || [];
}

// Mock audio features since Spotify deprecated this endpoint
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
