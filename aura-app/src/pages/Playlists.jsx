import { useMemo } from 'react';
import { getEntries } from '../data/store';

export default function Playlists() {
  const entries = useMemo(() => getEntries().filter(e => e.songName), []);

  // "Light days" playlist — songs from highest valence days
  const lightDays = useMemo(() => {
    return entries
      .filter(e => e.songFeatures?.valence > 0.6)
      .sort((a, b) => (b.songFeatures?.valence || 0) - (a.songFeatures?.valence || 0))
      .slice(0, 8);
  }, [entries]);

  // "Comfort songs" — songs during recovery transitions (after low stretch)
  const comfortSongs = useMemo(() => {
    const sorted = [...entries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const comfort = [];
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].songFeatures?.valence || 0.5;
      const curr = sorted[i].songFeatures?.valence || 0.5;
      if (prev < 0.35 && curr > prev + 0.15) {
        comfort.push(sorted[i]);
      }
    }
    if (comfort.length < 3) {
      // Fallback: mid-valence songs
      return entries
        .filter(e => (e.songFeatures?.valence || 0) > 0.4 && (e.songFeatures?.valence || 0) < 0.7)
        .slice(0, 6);
    }
    return comfort.slice(0, 8);
  }, [entries]);

  return (
    <div className="pb-6 px-5 pt-6 max-w-lg mx-auto page-enter">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-white mb-1">Playlists</h1>
        <p className="text-sm text-gray-500">Your emotional soundtracks</p>
      </div>

      <div className="space-y-8 stagger-children">
        {/* Light Days Playlist */}
        <PlaylistSection
          title="Your light days"
          subtitle="Songs from your brightest moments"
          tracks={lightDays}
          accentColor="#f0a050"
        />

        {/* Comfort Songs */}
        <PlaylistSection
          title="Your comfort songs"
          subtitle="The soundtrack of your recoveries"
          tracks={comfortSongs}
          accentColor="#b09cdf"
        />

        {/* In-the-moment suggestion */}
        {comfortSongs.length > 0 && (
          <div className="glass rounded-2xl p-5 border border-aura-lavender/10">
            <p className="text-sm text-gray-400 mb-3">
              Last time things felt heavy, these songs were playing when things started getting better:
            </p>
            <div className="space-y-2">
              {comfortSongs.slice(0, 3).map((track, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/3 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-aura-card flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-aura-lavender">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-white">{track.songName}</p>
                    <p className="text-[11px] text-gray-500">{track.songArtist}</p>
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
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)` }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div>
          <h2 className="font-serif text-lg text-white">{title}</h2>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>

      {tracks.length === 0 ? (
        <p className="text-sm text-gray-600 text-center py-6">Keep expressing to build this playlist</p>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          {tracks.map((track, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 border-b border-white/3 last:border-0 hover:bg-white/3 transition-colors"
            >
              <span className="text-xs text-gray-600 w-5 text-right">{i + 1}</span>
              <div className="w-10 h-10 rounded-lg bg-aura-card flex items-center justify-center shrink-0">
                {track.songAlbumArt ? (
                  <img src={track.songAlbumArt} alt="" className="w-full h-full rounded-lg" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500">
                    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{track.songName}</p>
                <p className="text-[11px] text-gray-500 truncate">{track.songArtist}</p>
              </div>
              {track.songFeatures && (
                <div
                  className="w-2 h-6 rounded-full"
                  style={{
                    background: `linear-gradient(to top,
                      hsl(${30 + track.songFeatures.valence * 120}, 60%, 35%),
                      hsl(${30 + track.songFeatures.valence * 120}, 60%, 50%))`,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
