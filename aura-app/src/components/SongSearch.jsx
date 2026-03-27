import { useState, useEffect, useRef } from 'react';
import { searchTracks, generateMockAudioFeatures } from '../utils/spotify';

export default function SongSearch({ spotifyToken, onSelect, selected }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!query.trim() || !spotifyToken) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const tracks = await searchTracks(spotifyToken, query);
      setResults(tracks);
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, spotifyToken]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (track) => {
    const features = generateMockAudioFeatures(track.id);
    onSelect({ ...track, features });
    setQuery('');
    setResults([]);
  };

  if (selected) {
    return (
      <div className="glass" style={{ borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', animation: 'bloom 0.6s ease-out both' }}>
        {selected.albumArt && (
          <img src={selected.albumArt} alt="" style={{
            width: '56px', height: '56px', borderRadius: '14px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#F0EDE6', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{selected.name}</p>
          <p style={{ fontSize: '13px', color: '#9B97A0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '2px 0 0' }}>{selected.artist}</p>
          {selected.features && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              {selected.features.valence < 0.35 && <MoodTag label="melancholic" color="#B8A9FF" />}
              {selected.features.valence > 0.65 && <MoodTag label="uplifting" color="#6EECD4" />}
              {selected.features.energy < 0.35 && <MoodTag label="low energy" color="#7EB8FF" />}
              {selected.features.energy > 0.65 && <MoodTag label="high energy" color="#FF6B8A" />}
              {selected.features.acousticness > 0.6 && <MoodTag label="acoustic" color="#F5A623" />}
              {selected.features.mode === 0 && <MoodTag label="minor key" color="#9B97A0" />}
            </div>
          )}
        </div>
        <button onClick={() => onSelect(null)} style={{ color: '#6B6777', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', zIndex: 50 }}>
      <div style={{ position: 'relative' }}>
        <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6B6777' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={spotifyToken ? "Search for a song..." : "Connect Spotify to search songs"}
          disabled={!spotifyToken}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            padding: '14px 16px 14px 44px',
            color: '#F0EDE6',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s',
            opacity: spotifyToken ? 1 : 0.4,
            boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(245,166,35,0.3)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.08)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
        />
        {searching && (
          <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }}>
            <div style={{ width: '16px', height: '16px', border: '2px solid rgba(245,166,35,0.3)', borderTop: '2px solid #F5A623', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', zIndex: 9999,
          backgroundColor: '#0f1017', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)', maxHeight: '250px', overflowY: 'auto',
        }}>
          {results.map((track, i) => (
            <button
              key={track.id}
              onClick={() => handleSelect(track)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                backgroundColor: '#0f1017', border: 'none', borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#0f1017'}
            >
              {track.albumArt && (
                <img src={track.albumArt} alt="" style={{ width: '40px', height: '40px', borderRadius: '10px', boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }} />
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: '14px', color: '#F0EDE6', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.name}</p>
                <p style={{ fontSize: '12px', color: '#6B6777', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.artist}</p>
              </div>
            </button>
          ))}
        </div>
      )}

    </div>
  );
}

function MoodTag({ label, color }) {
  return (
    <span style={{
      fontSize: '10px', padding: '3px 10px', borderRadius: '20px',
      background: `${color}15`, color: color, border: `1px solid ${color}25`,
      fontWeight: 500, letterSpacing: '0.02em',
    }}>
      {label}
    </span>
  );
}
