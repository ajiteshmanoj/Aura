import { useMemo } from 'react';
import { getEntries } from '../data/store';

export default function Playlists() {
  const entries = useMemo(() => getEntries().filter(e => e.songName), []);

  const lightDays = useMemo(() =>
    entries.filter(e => e.songFeatures?.valence > 0.6)
      .sort((a, b) => (b.songFeatures?.valence || 0) - (a.songFeatures?.valence || 0))
      .slice(0, 8),
  [entries]);

  const comfortSongs = useMemo(() => {
    const sorted = [...entries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const comfort = [];
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].songFeatures?.valence || 0.5;
      const curr = sorted[i].songFeatures?.valence || 0.5;
      if (prev < 0.35 && curr > prev + 0.15) comfort.push(sorted[i]);
    }
    return comfort.length >= 3 ? comfort.slice(0, 8) : entries.filter(e => (e.songFeatures?.valence || 0) > 0.4 && (e.songFeatures?.valence || 0) < 0.7).slice(0, 6);
  }, [entries]);

  return (
    <div className="pb-6 px-5 pt-6 max-w-lg mx-auto page-enter">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 600, color: '#F0EDE6', letterSpacing: '-0.02em', margin: '0 0 4px' }}>Playlists</h1>
        <p style={{ fontSize: '13px', color: '#6B6777', margin: 0 }}>Your emotional soundtracks</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <PlaylistSection title="Your light days" subtitle="Songs from your brightest moments" tracks={lightDays} accentColor="#F5A623" />
        <PlaylistSection title="Your comfort songs" subtitle="The soundtrack of your recoveries" tracks={comfortSongs} accentColor="#B8A9FF" />

        {comfortSongs.length > 0 && (
          <div className="glass" style={{ borderRadius: '20px', padding: '18px', borderLeft: '3px solid #B8A9FF' }}>
            <p style={{ fontSize: '13px', color: '#9B97A0', marginBottom: '12px', lineHeight: 1.6 }}>
              Last time things felt heavy, these songs were playing when things started getting better:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {comfortSongs.slice(0, 3).map((track, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '12px', transition: 'background 0.2s', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(184,169,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#B8A9FF"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: '#F0EDE6', margin: 0 }}>{track.songName}</p>
                    <p style={{ fontSize: '11px', color: '#6B6777', margin: '1px 0 0' }}>{track.songArtist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlaylistSection({ title, subtitle, tracks, accentColor }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '16px',
          background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}10)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 20px ${accentColor}15`,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', color: '#F0EDE6', margin: '0 0 2px' }}>{title}</h2>
          <p style={{ fontSize: '12px', color: '#6B6777', margin: 0 }}>{subtitle}</p>
        </div>
      </div>

      {tracks.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#6B6777', textAlign: 'center', padding: '24px 0' }}>Keep expressing to build this playlist</p>
      ) : (
        <div className="glass" style={{ borderRadius: '18px', overflow: 'hidden' }}>
          {tracks.map((track, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
              borderBottom: i < tracks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              transition: 'background 0.2s', cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '12px', color: '#6B6777', width: '20px', textAlign: 'right' }}>{i + 1}</span>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {track.songAlbumArt ? (
                  <img src={track.songAlbumArt} alt="" style={{ width: '100%', height: '100%', borderRadius: '10px' }} />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6777" strokeWidth="1.5"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', color: '#F0EDE6', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.songName}</p>
                <p style={{ fontSize: '11px', color: '#6B6777', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.songArtist}</p>
              </div>
              {track.songFeatures && (
                <div style={{
                  width: '4px', height: '24px', borderRadius: '4px',
                  background: `linear-gradient(to top, hsl(${30 + track.songFeatures.valence * 120}, 60%, 35%), hsl(${30 + track.songFeatures.valence * 120}, 60%, 50%))`,
                }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
