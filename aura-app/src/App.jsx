import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import NavBar from './components/NavBar';
import Landing from './pages/Landing';
import Express from './pages/Express';
import Reflect from './pages/Reflect';
import Report from './pages/Report';
import Echoes from './pages/Echoes';
import Canvas from './pages/Canvas';
import Playlists from './pages/Playlists';
import Atmosphere from './pages/Atmosphere';
import { handleSpotifyCallback } from './utils/spotify';
import { setSpotifyToken, setGoogleToken } from './data/store';

function SpotifyCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      handleSpotifyCallback(code).then(token => {
        if (token) setSpotifyToken(token);
        window.location.href = window.location.origin + '/express';
      }).catch(() => {
        window.location.href = window.location.origin + '/express';
      });
    } else {
      window.location.href = window.location.origin + '/express';
    }
  }, []);
  return <div className="flex items-center justify-center h-full text-gray-400">Connecting Spotify...</div>;
}

function GoogleCallback() {
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const token = params.get('access_token');
    if (token) setGoogleToken(token);
    window.location.href = window.location.origin + '/reflect';
  }, []);
  return <div className="flex items-center justify-center h-full text-gray-400">Connecting Calendar...</div>;
}

function AmbientGlow() {
  const [colour, setColour] = useState('#F5A623');

  useEffect(() => {
    const interval = setInterval(() => {
      const live = localStorage.getItem('aura_live_colour');
      if (live) { setColour(live); return; }
      try {
        const entries = JSON.parse(localStorage.getItem('aura_entries') || '[]');
        const last = entries[entries.length - 1];
        if (last?.colour) setColour(last.colour);
      } catch {}
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      transition: 'background 1.5s ease',
      background: `linear-gradient(160deg, ${colour}18 0%, ${colour}0a 40%, transparent 80%)`,
    }} />
  );
}

export default function App() {
  const location = useLocation();
  const isImmersive = location.pathname === '/atmosphere';
  const showNav = location.pathname !== '/' &&
    !location.pathname.startsWith('/callback') &&
    !isImmersive;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', position: 'relative' }}>
      <AmbientGlow />

      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/express" element={<Express />} />
          <Route path="/reflect" element={<Reflect />} />
          <Route path="/report" element={<Report />} />
          <Route path="/echoes" element={<Echoes />} />
          <Route path="/canvas" element={<Canvas />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/atmosphere" element={<Atmosphere />} />
          <Route path="/callback/spotify" element={<SpotifyCallback />} />
          <Route path="/callback/google" element={<GoogleCallback />} />
        </Routes>
      </div>

      {showNav && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(10, 10, 26, 0.85)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <NavBar />
          </div>
        </div>
      )}
    </div>
  );
}
