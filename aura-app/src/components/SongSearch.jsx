import { useState, useEffect } from 'react';
import { searchTracks, generateMockAudioFeatures } from '../utils/spotify';

export default function SongSearch({ spotifyToken, onSelect, selected }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

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

  const handleSelect = (track) => {
    const features = generateMockAudioFeatures(track.id);
    onSelect({ ...track, features });
    setQuery('');
    setResults([]);
  };

  if (selected) {
    return (
      <div className="glass rounded-2xl p-4 flex items-center gap-4 animate-bloom">
        {selected.albumArt && (
          <img src={selected.albumArt} alt="" className="w-14 h-14 rounded-xl shadow-md" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{selected.name}</p>
          <p className="text-sm text-gray-400 truncate">{selected.artist}</p>
          {selected.features && (
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {selected.features.valence < 0.35 && <MoodTag label="melancholic" />}
              {selected.features.valence > 0.65 && <MoodTag label="uplifting" />}
              {selected.features.energy < 0.35 && <MoodTag label="low energy" />}
              {selected.features.energy > 0.65 && <MoodTag label="high energy" />}
              {selected.features.acousticness > 0.6 && <MoodTag label="acoustic" />}
              {selected.features.mode === 0 && <MoodTag label="minor key" />}
            </div>
          )}
        </div>
        <button
          onClick={() => onSelect(null)}
          className="text-gray-500 hover:text-gray-300 transition-colors p-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={spotifyToken ? "Search for a song..." : "Connect Spotify to search songs"}
          disabled={!spotifyToken}
          className="w-full bg-aura-card/60 border border-aura-border/50 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-aura-amber/40 focus:ring-1 focus:ring-aura-amber/20 transition-all disabled:opacity-40"
        />
        {searching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-aura-amber/40 border-t-aura-amber rounded-full animate-spin" />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 glass rounded-xl overflow-hidden shadow-2xl">
          {results.map((track) => (
            <button
              key={track.id}
              onClick={() => handleSelect(track)}
              className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
            >
              {track.albumArt && (
                <img src={track.albumArt} alt="" className="w-10 h-10 rounded-lg" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{track.name}</p>
                <p className="text-xs text-gray-400 truncate">{track.artist}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MoodTag({ label }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">
      {label}
    </span>
  );
}
