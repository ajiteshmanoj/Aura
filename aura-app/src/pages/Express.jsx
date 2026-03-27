import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ColourPicker from '../components/ColourPicker';
import SongSearch from '../components/SongSearch';
import { saveEntry, getSpotifyToken } from '../data/store';
import { analyzeSingleSong } from '../utils/musicAnalysis';

export default function Express() {
  const navigate = useNavigate();
  const [colour, setColourRaw] = useState('');
  const setColour = (c) => {
    setColourRaw(c);
    // Write to a temp key so PhoneFrame picks it up instantly for ambient glow
    localStorage.setItem('aura_live_colour', c);
  };
  const [song, setSongRaw] = useState(null);
  const [songInsight, setSongInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);

  const setSong = (s) => {
    setSongRaw(s);
    setSongInsight('');
    if (s) {
      setInsightLoading(true);
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
      setTimeout(() => {
        analyzeSingleSong(s.name, s.artist, apiKey).then(insight => {
          setSongInsight(insight);
          setInsightLoading(false);
        });
      }, 1000); // Deliberate delay to feel like AI is "thinking"
    }
  };
  const [metaphor, setMetaphor] = useState('');
  const [freeform, setFreeform] = useState('');
  const [photo, setPhoto] = useState(null);
  const [saved, setSaved] = useState(false);
  const [spotifyToken, setSpotifyTokenState] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    setSpotifyTokenState(getSpotifyToken());
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const isLowMood = () => {
    if (song?.features?.valence < 0.35) return true;
    if (colour) {
      const h = colour.replace('#', '');
      const brightness = (parseInt(h.substr(0, 2), 16) + parseInt(h.substr(2, 2), 16) + parseInt(h.substr(4, 2), 16)) / 3;
      if (brightness < 100) return true;
    }
    return false;
  };

  const handleSave = () => {
    saveEntry({
      colour, metaphor: metaphor.trim() || undefined, freeformText: freeform.trim() || undefined,
      photoBase64: photo || undefined, songId: song?.id, songName: song?.name,
      songArtist: song?.artist, songAlbumArt: song?.albumArt, songFeatures: song?.features,
    });
    setSaved(true);
    if (!isLowMood()) {
      setTimeout(() => navigate('/reflect'), 1500);
    }
    // If low mood, the saved screen will show Atmosphere prompt instead of auto-navigating
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center px-6 page-enter min-h-dvh">
        <div style={{
          width: '96px', height: '96px', borderRadius: '50%', marginBottom: '24px',
          backgroundColor: colour || '#F5A623',
          boxShadow: `0 0 60px ${colour || '#F5A623'}50, 0 0 120px ${colour || '#F5A623'}20`,
          animation: 'bloom 0.6s ease-out both',
        }} />
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#F0EDE6', marginBottom: '8px' }}>Moment saved</p>

        {isLowMood() ? (
          <div style={{ textAlign: 'center', animation: 'fadeInUp 0.8s ease-out 0.5s both' }}>
            <p style={{ fontSize: '14px', color: '#9B97A0', marginBottom: '20px', lineHeight: 1.6 }}>
              It sounds heavy today. Want to step into Atmosphere for a few minutes?
            </p>
            <button
              onClick={() => navigate('/atmosphere')}
              style={{
                padding: '14px 32px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg, ${colour || '#3d5a80'}60, ${colour || '#3d5a80'}30)`,
                color: '#F0EDE6', fontSize: '14px', fontWeight: 600,
                boxShadow: `0 0 30px ${colour || '#3d5a80'}30`,
                animation: 'softPulse 3s ease-in-out infinite',
                marginBottom: '12px', display: 'block', width: '100%', maxWidth: '260px', margin: '0 auto 12px',
              }}
            >
              Enter Atmosphere
            </button>
            <button onClick={() => navigate('/reflect')} style={{ background: 'none', border: 'none', color: '#6B6777', fontSize: '13px', cursor: 'pointer' }}>
              Maybe later
            </button>
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: '#6B6777' }}>Taking you to your reflections...</p>
        )}
      </div>
    );
  }

  return (
    <div className="pb-24 px-5 pt-6 min-h-dvh max-w-lg mx-auto page-enter">
      {/* Ambient glow from selected colour */}
      {colour && (
        <div style={{
          position: 'absolute', top: '-10%', right: '-20%', width: '60%', height: '60%',
          background: `radial-gradient(circle, ${colour}30 0%, transparent 70%)`,
          filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
          animation: 'drift 20s ease-in-out infinite alternate', transition: 'background 1s ease',
        }} />
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 600, color: '#F0EDE6', letterSpacing: '-0.02em', margin: '0 0 4px' }}>Express</h1>
          <p style={{ fontSize: '13px', color: '#6B6777', margin: 0, letterSpacing: '0.02em' }}>How are you feeling right now?</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Colour Picker */}
          <Section title="Pick a colour" subtitle="What colour matches your mood?">
            <ColourPicker value={colour} onChange={setColour} />
          </Section>

          <div className="section-divider" />

          {/* Song of the Day */}
          <div style={{ position: 'relative', zIndex: 100 }}>
            <Section title="Song of the day" subtitle="What are you listening to?">
              <SongSearch spotifyToken={spotifyToken} selected={song} onSelect={setSong} />
              {/* AI song insight */}
              {song && (insightLoading ? (
                <p style={{ fontSize: '13px', color: '#6B6777', fontStyle: 'italic', marginTop: '10px', textAlign: 'center', animation: 'softPulse 2s ease-in-out infinite' }}>
                  Reading this choice...
                </p>
              ) : songInsight ? (
                <p style={{ fontSize: '13px', color: '#9B97A0', fontStyle: 'italic', marginTop: '10px', textAlign: 'center', animation: 'fadeIn 0.6s ease-out both' }}>
                  {songInsight}
                </p>
              ) : null)}
            </Section>
          </div>

          <div className="section-divider" />

          {/* Metaphor */}
          <Section title="Today I feel like..." subtitle="Complete the sentence">
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <span style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', fontSize: '48px', color: 'rgba(245,166,35,0.1)', fontFamily: "'Playfair Display', serif", pointerEvents: 'none' }}>"</span>
              <input
                type="text"
                value={metaphor}
                onChange={(e) => setMetaphor(e.target.value)}
                placeholder="...a phone on 2%, ...sunshine through a dirty window"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px', padding: '16px', color: '#F0EDE6', fontSize: '17px',
                  fontFamily: "'Playfair Display', serif", fontStyle: 'italic', textAlign: 'center',
                  outline: 'none', transition: 'border-color 0.3s', boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(184,169,255,0.3)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
              />
            </div>
          </Section>

          <div className="section-divider" />

          {/* Freeform */}
          <Section title="Anything on your mind?" subtitle="This is just for you">
            <textarea
              value={freeform}
              onChange={(e) => setFreeform(e.target.value)}
              placeholder="Write freely..."
              rows={4}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px', padding: '14px', color: '#F0EDE6', fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif", outline: 'none', resize: 'none',
                transition: 'border-color 0.3s', boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(184,169,255,0.3)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
            />
          </Section>

          <div className="section-divider" />

          {/* Photo */}
          <Section title="Capture a moment" subtitle="A photo from your day">
            {photo ? (
              <div style={{ position: 'relative', animation: 'bloom 0.6s ease-out both' }}>
                <div style={{ background: '#F0EDE6', padding: '8px', paddingBottom: '32px', borderRadius: '8px', maxWidth: '180px', margin: '0 auto', transform: 'rotate(-2deg)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  <img src={photo} alt="Your moment" style={{ borderRadius: '4px', width: '100%' }} />
                </div>
                <button onClick={() => setPhoto(null)} style={{ position: 'absolute', top: '8px', right: '24px', width: '24px', height: '24px', background: 'rgba(0,0,0,0.7)', borderRadius: '50%', border: 'none', color: '#F0EDE6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} style={{
                width: '100%', padding: '32px', border: '2px dashed rgba(255,255,255,0.06)', borderRadius: '20px',
                background: 'transparent', color: '#6B6777', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#9B97A0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#6B6777'; }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                <span style={{ fontSize: '13px' }}>Tap to add a photo</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </Section>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!colour && !metaphor && !freeform && !song}
            style={{
              width: '100%', padding: '16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              background: colour
                ? `linear-gradient(135deg, ${colour}, ${colour}cc)`
                : 'linear-gradient(135deg, #F5A623, #e6951a)',
              color: '#0a0a1a', fontWeight: 700, fontSize: '16px', letterSpacing: '0.03em',
              boxShadow: `0 8px 32px ${colour || '#F5A623'}40`,
              transition: 'all 0.3s', opacity: (!colour && !metaphor && !freeform && !song) ? 0.3 : 1,
              animation: (colour || metaphor || freeform || song) ? 'softPulse 3s ease-in-out infinite' : 'none',
            }}
          >
            Save this moment
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600, color: '#F0EDE6', letterSpacing: '-0.02em', margin: '0 0 2px' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: '12px', color: '#6B6777', margin: 0, letterSpacing: '0.02em' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
