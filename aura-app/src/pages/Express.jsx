import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ColourPicker from '../components/ColourPicker';
import SongSearch from '../components/SongSearch';
import { saveEntry, getSpotifyToken } from '../data/store';

export default function Express() {
  const navigate = useNavigate();
  const [colour, setColour] = useState('');
  const [song, setSong] = useState(null);
  const [metaphor, setMetaphor] = useState('');
  const [freeform, setFreeform] = useState('');
  const [photo, setPhoto] = useState(null);
  const [saved, setSaved] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    setSpotifyToken(getSpotifyToken());
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const entry = {
      colour,
      metaphor: metaphor.trim() || undefined,
      freeformText: freeform.trim() || undefined,
      photoBase64: photo || undefined,
      songId: song?.id,
      songName: song?.name,
      songArtist: song?.artist,
      songAlbumArt: song?.albumArt,
      songFeatures: song?.features,
    };
    saveEntry(entry);
    setSaved(true);
    setTimeout(() => navigate('/reflect'), 1500);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center px-6 page-enter h-full">
        <div
          className="w-24 h-24 rounded-full mb-6 animate-bloom"
          style={{
            backgroundColor: colour || '#5ab5a0',
            boxShadow: `0 0 60px ${colour || '#5ab5a0'}50, 0 0 120px ${colour || '#5ab5a0'}20`,
          }}
        />
        <p className="font-serif text-2xl text-white mb-2">Moment saved</p>
        <p className="text-gray-500 text-sm">Taking you to your reflections...</p>
      </div>
    );
  }

  return (
    <div className="pb-6 px-5 pt-6 max-w-lg mx-auto page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-white mb-1">Express</h1>
        <p className="text-sm text-gray-500">How are you feeling right now?</p>
      </div>

      <div className="space-y-8">
        {/* Colour Picker */}
        <Section
          title="Pick a colour"
          subtitle="What colour matches your mood?"
          colour={colour}
        >
          <ColourPicker value={colour} onChange={setColour} />
        </Section>

        {/* Song of the Day — pulled out of stagger-children so dropdown z-index works */}
        <div style={{ position: 'relative', zIndex: 100 }}>
          <Section
            title="Song of the day"
            subtitle="What are you listening to?"
            icon="music"
          >
            <SongSearch
              spotifyToken={spotifyToken}
              selected={song}
              onSelect={setSong}
            />
          </Section>
        </div>

        {/* Metaphor */}
        <Section
          title="Today I feel like..."
          subtitle="Complete the sentence"
          icon="feather"
        >
          <input
            type="text"
            value={metaphor}
            onChange={(e) => setMetaphor(e.target.value)}
            placeholder="...a phone on 2%, ...sunshine through a dirty window"
            className="w-full bg-aura-card/60 border border-aura-border/50 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-aura-lavender/40 focus:ring-1 focus:ring-aura-lavender/20 transition-all"
          />
        </Section>

        {/* Freeform */}
        <Section
          title="Anything on your mind?"
          subtitle="This is just for you"
          icon="pen"
        >
          <textarea
            value={freeform}
            onChange={(e) => setFreeform(e.target.value)}
            placeholder="Write freely..."
            rows={4}
            className="w-full bg-aura-card/60 border border-aura-border/50 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-aura-lavender/40 focus:ring-1 focus:ring-aura-lavender/20 transition-all resize-none"
          />
        </Section>

        {/* Photo */}
        <Section title="Capture a moment" subtitle="A photo from your day" icon="camera">
          {photo ? (
            <div className="relative animate-bloom">
              <div className="bg-white p-2 pb-8 rounded-lg shadow-xl max-w-[200px] mx-auto rotate-[-2deg]">
                <img src={photo} alt="Your moment" className="rounded w-full" />
              </div>
              <button
                onClick={() => setPhoto(null)}
                className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-8 border-2 border-dashed border-aura-border/50 rounded-2xl text-gray-500 hover:text-gray-300 hover:border-aura-border transition-all flex flex-col items-center gap-2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="text-sm">Tap to add a photo</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </Section>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!colour && !metaphor && !freeform && !song}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-aura-amber/80 to-aura-amber text-aura-bg font-semibold text-lg shadow-lg shadow-aura-amber/20 hover:shadow-aura-amber/30 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          Save this moment
        </button>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children, colour, icon }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {colour && (
          <div
            className="w-3 h-3 rounded-full transition-all duration-500"
            style={{ backgroundColor: colour, boxShadow: `0 0 8px ${colour}60` }}
          />
        )}
        <div>
          <h2 className="font-serif text-lg text-white">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
