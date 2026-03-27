import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNoise3D } from 'simplex-noise';
import { getEntries } from '../data/store';
import { saveEntry } from '../data/store';

const noise3D = createNoise3D();
const DEMO_MODE = true;
const SESSION_DURATION = DEMO_MODE ? 30 * 1000 : 5 * 60 * 1000;

function hexToHSL(hex) {
  const h = hex.replace('#', '');
  let r = parseInt(h.substr(0, 2), 16) / 255;
  let g = parseInt(h.substr(2, 2), 16) / 255;
  let b = parseInt(h.substr(4, 2), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hue, sat, lig = (max + min) / 2;
  if (max === min) { hue = sat = 0; }
  else {
    const d = max - min;
    sat = lig > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: hue = ((b - r) / d + 2) / 6; break;
      case b: hue = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: hue * 360, s: sat * 100, l: lig * 100 };
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function lerpHueTowardWarm(hue, amount) {
  const warmTarget = 40;
  let diff = warmTarget - hue;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return (hue + diff * amount + 360) % 360;
}

function getAtmosphereParams(userColourHex, moodScore) {
  const hsl = userColourHex ? hexToHSL(userColourHex) : { h: 220, s: 30, l: 30 };
  const ms = moodScore ?? 0.4;

  const start = {
    baseHue: hsl.h,
    saturation: Math.max(15, hsl.s * 0.6),
    brightness: 10 + (ms * 20),
    speed: 0.2 + (ms * 0.4),
    complexity: 2 + Math.floor(ms * 4),
    breathRate: 5.5,
    audioFreqBase: 60 + (ms * 120),
    audioFilterCutoff: 200 + (ms * 800),
    audioVolume: 0.3,
  };

  const end = {
    baseHue: lerpHueTowardWarm(start.baseHue, 0.15),
    saturation: Math.min(60, start.saturation + 15),
    brightness: Math.min(35, start.brightness + 12),
    speed: Math.min(0.7, start.speed + 0.2),
    complexity: Math.min(7, start.complexity + 2),
    breathRate: 5.5,
    audioFreqBase: Math.min(200, start.audioFreqBase + 60),
    audioFilterCutoff: Math.min(1200, start.audioFilterCutoff + 400),
    audioVolume: 0.25,
  };

  return { start, end };
}

function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

function drawAtmosphere(ctx, width, height, params, elapsedMs) {
  const t = elapsedMs / 1000;
  const breathCycle = Math.sin(t * params.breathRate * Math.PI / 30);

  ctx.fillStyle = `hsl(${params.baseHue}, ${params.saturation * 0.3}%, ${params.brightness * 0.4}%)`;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < Math.floor(params.complexity); i++) {
    const formPhase = (i / params.complexity) * Math.PI * 2;
    const cx = width / 2 + Math.sin(t * params.speed * 0.1 + formPhase) * width * 0.15;
    const cy = height / 2 + Math.cos(t * params.speed * 0.08 + formPhase) * height * 0.1;
    const baseRadius = (height * 0.15) + (breathCycle * height * 0.03);

    ctx.beginPath();
    const points = 64;
    for (let p = 0; p <= points; p++) {
      const angle = (p / points) * Math.PI * 2;
      const noiseVal = noise3D(Math.cos(angle) * 0.5 + i, Math.sin(angle) * 0.5 + i, t * params.speed * 0.15);
      const r = baseRadius * (0.7 + i * 0.15) + noiseVal * baseRadius * 0.4;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (p === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();

    const hueShift = i * 20;
    const alpha = 0.08 + (i * 0.03);
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 1.5);
    gradient.addColorStop(0, `hsla(${params.baseHue + hueShift}, ${params.saturation}%, ${params.brightness + 10}%, ${alpha + 0.05})`);
    gradient.addColorStop(1, `hsla(${params.baseHue + hueShift}, ${params.saturation * 0.5}%, ${params.brightness}%, 0)`);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // Central breathing glow
  const glowRadius = height * 0.2 + breathCycle * height * 0.04;
  const glowGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, glowRadius);
  glowGradient.addColorStop(0, `hsla(${params.baseHue}, ${params.saturation + 10}%, ${params.brightness + 15}%, 0.12)`);
  glowGradient.addColorStop(0.5, `hsla(${params.baseHue}, ${params.saturation}%, ${params.brightness + 5}%, 0.05)`);
  glowGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, width, height);

  // Particle dust
  const particleCount = Math.floor(params.brightness * 0.8);
  for (let p = 0; p < particleCount; p++) {
    const px = (noise3D(p * 0.1, t * 0.02, 0) + 1) * 0.5 * width;
    const py = (noise3D(0, p * 0.1, t * 0.03) + 1) * 0.5 * height;
    const pAlpha = 0.1 + noise3D(p, t * 0.05, 0) * 0.1;
    ctx.fillStyle = `hsla(${params.baseHue + 30}, ${params.saturation + 20}%, ${params.brightness + 30}%, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function createAtmosphereAudio(audioCtx, startParams, endParams, durationMs) {
  const durSec = durationMs / 1000;

  const drone = audioCtx.createOscillator();
  drone.type = 'sine';
  drone.frequency.setValueAtTime(startParams.audioFreqBase, audioCtx.currentTime);
  drone.frequency.linearRampToValueAtTime(endParams.audioFreqBase, audioCtx.currentTime + durSec);

  const shimmer = audioCtx.createOscillator();
  shimmer.type = 'sine';
  shimmer.frequency.setValueAtTime(startParams.audioFreqBase * 3, audioCtx.currentTime);
  shimmer.frequency.linearRampToValueAtTime(endParams.audioFreqBase * 3, audioCtx.currentTime + durSec);

  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = startParams.breathRate / 60;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 0.08;
  lfo.connect(lfoGain);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(startParams.audioFilterCutoff, audioCtx.currentTime);
  filter.frequency.linearRampToValueAtTime(endParams.audioFilterCutoff, audioCtx.currentTime + durSec);
  filter.Q.value = 1;

  const convolver = audioCtx.createConvolver();
  const sampleRate = audioCtx.sampleRate;
  const impulse = audioCtx.createBuffer(2, sampleRate * 3, sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }
  }
  convolver.buffer = impulse;

  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(startParams.audioVolume, audioCtx.currentTime + 3);
  masterGain.gain.linearRampToValueAtTime(endParams.audioVolume, audioCtx.currentTime + durSec);

  drone.connect(filter);
  shimmer.connect(filter);
  filter.connect(convolver);
  filter.connect(masterGain);
  convolver.connect(masterGain);
  lfoGain.connect(masterGain.gain);
  masterGain.connect(audioCtx.destination);

  drone.start();
  shimmer.start();
  lfo.start();

  return {
    stop: () => {
      masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2);
      setTimeout(() => { drone.stop(); shimmer.stop(); lfo.stop(); }, 2500);
    },
  };
}

export default function Atmosphere() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const animRef = useRef(null);
  const startTimeRef = useRef(null);
  const paramsRef = useRef(null);

  const [phase, setPhase] = useState('intro'); // intro | active | summary
  const [elapsed, setElapsed] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showBreathHint, setShowBreathHint] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  const holdTimerRef = useRef(null);
  const holdStartRef = useRef(null);
  const holdAnimRef = useRef(null);

  // Get user's mood data
  const entries = getEntries();
  const latest = entries[entries.length - 1];
  const userColour = latest?.colour || '#3d5a80';
  const moodScore = latest?.songFeatures?.valence ?? 0.4;

  const startSession = useCallback(() => {
    const { start, end } = getAtmosphereParams(userColour, moodScore);
    paramsRef.current = { start, end };

    setPhase('active');
    setShowHint(true);
    setTimeout(() => setShowHint(false), 3000);
    setTimeout(() => setShowBreathHint(true), 10000);
    setTimeout(() => setShowBreathHint(false), 20000);

    // Start audio
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;
    audioRef.current = createAtmosphereAudio(audioCtx, start, end, SESSION_DURATION);

    // Start visual
    const canvas = canvasRef.current;
    if (!canvas) return;
    startTimeRef.current = performance.now();

    function animate(now) {
      const el = now - startTimeRef.current;
      const progress = Math.min(el / SESSION_DURATION, 1);
      const easedProgress = easeInOut(progress);

      const currentParams = {};
      for (const key of Object.keys(start)) {
        currentParams[key] = lerp(start[key], end[key], easedProgress);
      }

      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      drawAtmosphere(ctx, canvas.clientWidth, canvas.clientHeight, currentParams, el);
      setElapsed(el);

      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);
  }, [userColour, moodScore]);

  const endSession = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    audioRef.current?.stop();

    const { start, end } = paramsRef.current || getAtmosphereParams(userColour, moodScore);
    const startColour = hslToHex(start.baseHue, start.saturation, start.brightness + 20);
    const endColour = hslToHex(end.baseHue, end.saturation, end.brightness + 20);

    setSummaryData({
      duration: elapsed,
      startColour,
      endColour,
      durationText: formatTime(elapsed),
    });
    setPhase('summary');
  }, [elapsed, userColour, moodScore]);

  // Hold-to-exit
  const onHoldStart = useCallback(() => {
    holdStartRef.current = Date.now();
    function tick() {
      const prog = Math.min((Date.now() - holdStartRef.current) / 1000, 1);
      setHoldProgress(prog);
      if (prog >= 1) { endSession(); return; }
      holdAnimRef.current = requestAnimationFrame(tick);
    }
    holdAnimRef.current = requestAnimationFrame(tick);
  }, [endSession]);

  const onHoldEnd = useCallback(() => {
    if (holdAnimRef.current) cancelAnimationFrame(holdAnimRef.current);
    setHoldProgress(0);
  }, []);

  useEffect(() => {
    // Auto-start after intro fade
    const timer = setTimeout(startSession, 1500);
    return () => {
      clearTimeout(timer);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      audioRef.current?.stop();
    };
  }, []);

  const saveSummary = () => {
    if (summaryData) {
      saveEntry({
        colour: summaryData.endColour,
        freeformText: `Atmosphere session — ${summaryData.durationText}`,
        metaphor: 'A moment of stillness',
        isAtmosphereSession: true,
        atmosphereDuration: summaryData.duration,
        atmosphereStartColour: summaryData.startColour,
        atmosphereEndColour: summaryData.endColour,
      });
    }
    navigate('/reflect');
  };

  // INTRO phase — fade to black
  if (phase === 'intro') {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#000', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 1.5s ease-out both',
      }}>
        <p style={{ color: 'rgba(240,237,230,0.3)', fontSize: '14px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
          Entering your atmosphere...
        </p>
      </div>
    );
  }

  // SUMMARY phase
  if (phase === 'summary' && summaryData) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#0a0a1a', zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '32px', animation: 'fadeIn 1s ease-out both',
      }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#F0EDE6', marginBottom: '24px', textAlign: 'center' }}>
          {summaryData.durationText} in Atmosphere
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: summaryData.startColour, boxShadow: `0 0 24px ${summaryData.startColour}40`, margin: '0 auto 6px' }} />
            <span style={{ fontSize: '10px', color: '#6B6777' }}>entered</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B6777" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: summaryData.endColour, boxShadow: `0 0 24px ${summaryData.endColour}40`, margin: '0 auto 6px' }} />
            <span style={{ fontSize: '10px', color: '#6B6777' }}>shifted to</span>
          </div>
        </div>

        <p style={{ fontSize: '14px', color: '#9B97A0', textAlign: 'center', lineHeight: 1.7, marginBottom: '32px', fontStyle: 'italic', maxWidth: '280px' }}>
          Sometimes just being still is enough.
        </p>

        <button onClick={saveSummary} style={{
          width: '100%', maxWidth: '280px', padding: '14px', borderRadius: '20px', border: 'none',
          background: 'linear-gradient(135deg, rgba(245,166,35,0.2), rgba(184,169,255,0.15))',
          color: '#F0EDE6', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
        }}>
          Save to journal
        </button>

        <button onClick={() => navigate('/reflect')} style={{
          marginTop: '12px', background: 'none', border: 'none', color: '#6B6777',
          fontSize: '13px', cursor: 'pointer',
        }}>
          Skip
        </button>
      </div>
    );
  }

  // ACTIVE phase — full-screen immersive
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', cursor: 'pointer' }}
      onMouseDown={onHoldStart}
      onMouseUp={onHoldEnd}
      onMouseLeave={onHoldEnd}
      onTouchStart={onHoldStart}
      onTouchEnd={onHoldEnd}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />

      {/* Timer */}
      <div style={{
        position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        fontSize: '12px', color: 'rgba(240,237,230,0.2)', fontFamily: 'monospace',
      }}>
        {formatTime(elapsed)}
      </div>

      {/* Hold to exit hint */}
      {showHint && (
        <div style={{
          position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
          fontSize: '12px', color: 'rgba(240,237,230,0.3)',
          animation: 'fadeIn 1s ease-out both',
        }}>
          Hold to exit
        </div>
      )}

      {/* Breath hint */}
      {showBreathHint && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          fontSize: '14px', color: 'rgba(240,237,230,0.2)', fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic', animation: 'fadeIn 2s ease-out both',
        }}>
          breathe with the rhythm
        </div>
      )}

      {/* Hold progress ring */}
      {holdProgress > 0 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '60px', height: '60px',
        }}>
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(240,237,230,0.1)" strokeWidth="2" />
            <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(240,237,230,0.5)" strokeWidth="2"
              strokeDasharray={`${holdProgress * 163.4} 163.4`}
              strokeLinecap="round"
              transform="rotate(-90 30 30)"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}
