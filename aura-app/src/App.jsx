import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import PhoneFrame from './components/PhoneFrame';
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

function PageContent() {
  return (
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
  );
}

export default function App() {
  const location = useLocation();
  const showNav = location.pathname !== '/' &&
    !location.pathname.startsWith('/callback');

  return (
    <PhoneFrame bottomNav={showNav ? <NavBar /> : null}>
      <PageContent />
    </PhoneFrame>
  );
}
