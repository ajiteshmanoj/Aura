import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { seedMockData } from '../data/mockData';
import { getEntries } from '../data/store';
import { initiateSpotifyAuth } from '../utils/spotify';
import { initiateGoogleAuth } from '../utils/calendar';

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    seedMockData();
  }, []);

  const hasEntries = getEntries().length > 0;

  return (
    <div className="flex flex-col items-center justify-center px-6 relative overflow-hidden h-full min-h-[600px]">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-aura-amber/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-aura-lavender/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md stagger-children">
        {/* Logo / Brand */}
        <div className="mb-8">
          <h1 className="font-serif text-6xl md:text-7xl font-medium text-white tracking-tight">
            Aura
          </h1>
          <div className="w-12 h-0.5 bg-gradient-to-r from-aura-amber to-aura-lavender mx-auto mt-4 rounded-full" />
        </div>

        {/* Tagline */}
        <p className="text-lg text-gray-400 leading-relaxed mb-2">
          Express how you feel.
        </p>
        <p className="text-lg text-gray-400 leading-relaxed mb-2">
          See why you feel it.
        </p>
        <p className="text-lg text-aura-amber/80 leading-relaxed mb-10">
          Know you're not alone.
        </p>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed mb-10 max-w-xs mx-auto">
          Your emotional wellness companion. Express through colours, music, and metaphors.
          Discover patterns between your inner world and daily life.
        </p>

        {/* Main CTA */}
        <button
          onClick={() => navigate('/express')}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-aura-amber/90 to-aura-amber text-aura-bg font-semibold text-lg shadow-lg shadow-aura-amber/20 hover:shadow-aura-amber/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mb-4"
        >
          {hasEntries ? 'How are you today?' : 'Begin your journey'}
        </button>

        {hasEntries && (
          <button
            onClick={() => navigate('/reflect')}
            className="w-full py-3 rounded-2xl border border-aura-border/50 text-gray-400 hover:text-white hover:border-aura-lavender/30 transition-all duration-300 mb-4"
          >
            View your reflections
          </button>
        )}

        {/* Connect services */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              if (import.meta.env.VITE_SPOTIFY_CLIENT_ID) {
                initiateSpotifyAuth();
              } else {
                navigate('/express');
              }
            }}
            className="flex-1 py-2.5 rounded-xl glass text-sm text-gray-400 hover:text-green-400 hover:border-green-400/20 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Spotify
          </button>
          <button
            onClick={() => {
              if (import.meta.env.VITE_GOOGLE_CLIENT_ID) {
                initiateGoogleAuth();
              } else {
                navigate('/express');
              }
            }}
            className="flex-1 py-2.5 rounded-xl glass text-sm text-gray-400 hover:text-blue-400 hover:border-blue-400/20 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
