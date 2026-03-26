import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import NavBar from './components/NavBar';
import Landing from './pages/Landing';
import Express from './pages/Express';
import Reflect from './pages/Reflect';
import Report from './pages/Report';
import Echoes from './pages/Echoes';
import Canvas from './pages/Canvas';
import Playlists from './pages/Playlists';
import { handleSpotifyCallback } from './utils/spotify';
import { setSpotifyToken, setGoogleToken } from './data/store';

function SpotifyCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      handleSpotifyCallback(code).then(token => {
        if (token) setSpotifyToken(token);
        window.location.href = '/express';
      });
    }
  }, []);
  return <div className="min-h-dvh flex items-center justify-center text-gray-400">Connecting Spotify...</div>;
}

function GoogleCallback() {
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const token = params.get('access_token');
    if (token) {
      setGoogleToken(token);
    }
    window.location.href = '/reflect';
  }, []);
  return <div className="min-h-dvh flex items-center justify-center text-gray-400">Connecting Calendar...</div>;
}

export default function App() {
  const location = useLocation();
  const showNav = location.pathname !== '/';

  return (
    <div className="min-h-dvh">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-aura-amber/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-aura-lavender/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/express" element={<Express />} />
          <Route path="/reflect" element={<Reflect />} />
          <Route path="/report" element={<Report />} />
          <Route path="/echoes" element={<Echoes />} />
          <Route path="/canvas" element={<Canvas />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/callback/spotify" element={<SpotifyCallback />} />
          <Route path="/callback/google" element={<GoogleCallback />} />
        </Routes>
      </div>

      {showNav && <NavBar />}
    </div>
  );
}
