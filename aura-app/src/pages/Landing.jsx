import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { seedMockData } from '../data/mockData';
import { getEntries } from '../data/store';
import { initiateSpotifyAuth } from '../utils/spotify';
import { initiateGoogleAuth } from '../utils/calendar';

export default function Landing() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    seedMockData();
    setTimeout(() => setShow(true), 100);
  }, []);

  const hasEntries = getEntries().length > 0;

  return (
    <div className="flex flex-col items-center justify-center px-6 relative overflow-hidden min-h-dvh">
      {/* Drifting ambient orbs */}
      <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', animation: 'drift 20s ease-in-out infinite alternate' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '-15%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(184,169,255,0.08) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', animation: 'driftReverse 25s ease-in-out infinite alternate' }} />
      <div style={{ position: 'absolute', top: '40%', left: '50%', width: '30%', height: '30%', background: 'radial-gradient(circle, rgba(255,107,138,0.06) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', animation: 'drift 30s ease-in-out infinite alternate-reverse' }} />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '360px', opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease-out' }}>
        {/* Logo */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '72px', fontWeight: 600, color: '#F0EDE6', letterSpacing: '-0.03em', margin: 0, textShadow: '0 0 60px rgba(245,166,35,0.15)' }}>
            Aura
          </h1>
          <div style={{ width: '48px', height: '2px', background: 'linear-gradient(90deg, #F5A623, #B8A9FF)', margin: '16px auto', borderRadius: '2px' }} />
        </div>

        {/* Tagline — each word styled differently */}
        <div style={{ marginBottom: '40px', lineHeight: 1.8 }}>
          <p style={{ fontSize: '18px', margin: '0 0 4px' }}>
            <span style={{ color: '#F5A623' }}>Express</span>
            <span style={{ color: '#9B97A0' }}> how you </span>
            <span style={{ color: '#FF6B8A' }}>feel</span>
            <span style={{ color: '#9B97A0' }}>.</span>
          </p>
          <p style={{ fontSize: '18px', margin: '0 0 4px' }}>
            <span style={{ color: '#B8A9FF' }}>See</span>
            <span style={{ color: '#9B97A0' }}> why you feel it.</span>
          </p>
          <p style={{ fontSize: '18px', margin: 0 }}>
            <span style={{ color: '#9B97A0' }}>Know you're </span>
            <span style={{ color: '#6EECD4' }}>not alone</span>
            <span style={{ color: '#9B97A0' }}>.</span>
          </p>
        </div>

        {/* Description */}
        <p style={{ fontSize: '13px', color: '#6B6777', lineHeight: 1.7, marginBottom: '36px', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
          Your emotional wellness companion. Express through colours, music, and metaphors.
        </p>

        {/* Main CTA */}
        <button
          onClick={() => navigate('/express')}
          style={{
            width: '100%', padding: '16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #F5A623, #e6951a)', color: '#0a0a1a',
            fontWeight: 700, fontSize: '16px', letterSpacing: '0.03em',
            boxShadow: '0 8px 32px rgba(245,166,35,0.3), 0 0 60px rgba(245,166,35,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            marginBottom: '12px',
          }}
          onMouseEnter={(e) => { e.target.style.transform = 'scale(1.02)'; e.target.style.boxShadow = '0 12px 40px rgba(245,166,35,0.4)'; }}
          onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 8px 32px rgba(245,166,35,0.3)'; }}
        >
          {hasEntries ? 'How are you today?' : 'Begin your journey'}
        </button>

        {hasEntries && (
          <button
            onClick={() => navigate('/reflect')}
            style={{
              width: '100%', padding: '14px', borderRadius: '20px', cursor: 'pointer',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
              color: '#9B97A0', fontSize: '14px', fontWeight: 500,
              transition: 'all 0.3s', marginBottom: '12px',
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = 'rgba(184,169,255,0.3)'; e.target.style.color = '#F0EDE6'; }}
            onMouseLeave={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.color = '#9B97A0'; }}
          >
            View your reflections
          </button>
        )}

        {/* Connect services */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={() => import.meta.env.VITE_SPOTIFY_CLIENT_ID ? initiateSpotifyAuth() : navigate('/express')}
            className="glass"
            style={{
              flex: 1, padding: '10px', borderRadius: '14px', cursor: 'pointer',
              fontSize: '13px', color: '#6B6777', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.3s', background: 'rgba(255,255,255,0.03)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1DB954'; e.currentTarget.style.borderColor = 'rgba(29,185,84,0.2)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(29,185,84,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6B6777'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Spotify
          </button>
          <button
            onClick={() => import.meta.env.VITE_GOOGLE_CLIENT_ID ? initiateGoogleAuth() : navigate('/express')}
            className="glass"
            style={{
              flex: 1, padding: '10px', borderRadius: '14px', cursor: 'pointer',
              fontSize: '13px', color: '#6B6777', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.3s', background: 'rgba(255,255,255,0.03)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#7EB8FF'; e.currentTarget.style.borderColor = 'rgba(126,184,255,0.2)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(126,184,255,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6B6777'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
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
