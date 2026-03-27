import { useMemo, useState, useEffect } from 'react';
import { getEntries, getSpotifyToken } from '../data/store';
import { fetchAllSpotifyData, getCachedSpotifyData } from '../utils/spotify';

export default function Playlists() {
  const entries = useMemo(() => getEntries().filter(e => e.songName), []);
  const token = getSpotifyToken();
  const [spotifyData, setSpotifyData] = useState(getCachedSpotifyData());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !spotifyData) {
      setLoading(true);
      fetchAllSpotifyData(token).then(data => {
        if (data) setSpotifyData(data);
        setLoading(false);
      });
    }
  }, [token]);

  // Real playlists from Spotify data, or fallback to entries
  const lightDays = useMemo(() => {
    if (spotifyData?.topMedium?.length) {
      return spotifyData.topMedium.sort((a, b) => b.popularity - a.popularity).slice(0, 10);
    }
    return entries.filter(e => e.songFeatures?.valence > 0.6)
      .sort((a, b) => (b.songFeatures?.valence || 0) - (a.songFeatures?.valence || 0))
      .slice(0, 8)
      .map(e => ({ id: e.songId, name: e.songName, artist: e.songArtist, albumArt: e.songAlbumArt || '', externalUrl: '', popularity: 0 }));
  }, [spotifyData, entries]);

  const comfortSongs = useMemo(() => {
    if (spotifyData?.recent?.length) {
      // Most repeated tracks in recent = comfort songs
      const counts = {};
      for (const t of spotifyData.recent) {
        counts[t.id] = (counts[t.id] || { ...t, count: 0 });
        counts[t.id].count++;
      }
      const repeated = Object.values(counts).filter(t => t.count > 1).sort((a, b) => b.count - a.count);
      if (repeated.length >= 3) return repeated.slice(0, 10);
      // Fallback: short-term top tracks
      return spotifyData.topShort?.slice(0, 8) || [];
    }
    return entries.filter(e => (e.songFeatures?.valence || 0) > 0.4 && (e.songFeatures?.valence || 0) < 0.7)
      .slice(0, 6)
      .map(e => ({ id: e.songId, name: e.songName, artist: e.songArtist, albumArt: e.songAlbumArt || '', externalUrl: '', popularity: 0 }));
  }, [spotifyData, entries]);

  const noSpotify = !token;

  return (
    <div className="pb-24 px-5 pt-6 min-h-dvh max-w-lg mx-auto page-enter">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 600, color: '#F0EDE6', letterSpacing: '-0.02em', margin: '0 0 4px' }}>Playlists</h1>
        <p style={{ fontSize: '13px', color: '#6B6777', margin: 0 }}>Your emotional soundtracks</p>
      </div>

      {noSpotify && (
        <div className="glass" style={{ borderRadius: '20px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#1DB954" style={{ marginBottom: '12px' }}>
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2z" />
          </svg>
          <p style={{ color: '#F0EDE6', fontSize: '15px', marginBottom: '4px' }}>Connect Spotify to unlock music insights</p>
          <p style={{ color: '#6B6777', fontSize: '12px' }}>Your real listening data powers personalised playlists</p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ width: '24px', height: '24px', border: '2px solid rgba(245,166,35,0.3)', borderTop: '2px solid #F5A623', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#6B6777', fontSize: '13px' }}>Loading your music...</p>
        </div>
      )}

      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <PlaylistSection title="Your light days" subtitle="Songs from your brightest moments" tracks={lightDays} accentColor="#F5A623" />
          <PlaylistSection title="Your comfort songs" subtitle={spotifyData ? "Tracks you keep coming back to" : "The soundtrack of your recoveries"} tracks={comfortSongs} accentColor="#B8A9FF" />

          {comfortSongs.length > 0 && (
            <div className="glass" style={{ borderRadius: '20px', padding: '18px', borderLeft: '3px solid #B8A9FF' }}>
              <p style={{ fontSize: '13px', color: '#9B97A0', marginBottom: '12px', lineHeight: 1.6 }}>
                {spotifyData ? "These are the songs you reach for most:" : "Last time things felt heavy, these songs helped:"}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {comfortSongs.slice(0, 3).map((track, i) => (
                  <a key={i} href={track.externalUrl || `https://open.spotify.com/track/${track.id}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '12px', textDecoration: 'none', transition: 'background 0.2s', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {track.albumArt ? (
                      <img src={track.albumArt} alt="" style={{ width: '36px', height: '36px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }} />
                    ) : (
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(184,169,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#B8A9FF"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: '13px', color: '#F0EDE6', margin: 0 }}>{track.name}</p>
                      <p style={{ fontSize: '11px', color: '#6B6777', margin: '1px 0 0' }}>{track.artist}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlaylistSection({ title, subtitle, tracks, accentColor }) {
  // Playlist header mosaic from top 4 album arts
  const mosaicArts = tracks.slice(0, 4).map(t => t.albumArt).filter(Boolean);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
        {mosaicArts.length >= 4 ? (
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', flexShrink: 0 }}>
            {mosaicArts.map((art, i) => (
              <img key={i} src={art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ))}
          </div>
        ) : (
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px', flexShrink: 0,
            background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}10)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px ${accentColor}15`,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
          </div>
        )}
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
            <a key={i}
              href={track.externalUrl || `https://open.spotify.com/track/${track.id}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
                borderBottom: i < tracks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                transition: 'background 0.2s', cursor: 'pointer', textDecoration: 'none',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '12px', color: '#6B6777', width: '20px', textAlign: 'right' }}>{i + 1}</span>
              {track.albumArt ? (
                <img src={track.albumArt} alt="" style={{ width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }} />
              ) : (
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6777" strokeWidth="1.5"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', color: '#F0EDE6', margin: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.name}</p>
                <p style={{ fontSize: '11px', color: '#6B6777', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.artist}</p>
              </div>
              {/* Spotify play icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954" style={{ flexShrink: 0, opacity: 0.6 }}>
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm4.5 17.1l-1.4.8c-.3.2-.7 0-.7-.3v-1.1c-2.4 1.5-5.5 1.8-8.2.9-.4-.1-.5-.5-.4-.8.1-.4.5-.5.8-.4 2.3.7 4.9.5 7-.7v-1c0-.3.4-.5.7-.3l1.4.8c.3.2.3.5 0 .7l.8.4z" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
