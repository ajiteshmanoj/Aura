# Aura Atmosphere — AI-Generated Sensory Environment

Read all project files first. This is a major new feature: a full-screen immersive experience that uses generative visuals and audio to meet the user's current emotional state and gradually shift it toward something lighter. This is Aura's most innovative feature.

## Concept

When a user is feeling low, they don't want advice or dashboards. Aura Atmosphere generates a personalised sensory environment — abstract visuals + ambient soundscape — that MATCHES their current mood, then SLOWLY AND IMPERCEPTIBLY shifts toward a lighter state over 5 minutes. The user doesn't meditate. They don't follow instructions. They just exist inside the environment, and the environment does the work.

This is based on the principle of ENTRAINMENT — biological rhythms synchronise to external stimuli. The visual rhythm follows a breathing pace (~5.5 breaths per minute), the colours gradually warm, and the soundscape gradually lifts.

## New Route

Add a new page: `/atmosphere`
It should be accessible from:
1. A button on the Express page after saving a low-mood check-in: "Enter Atmosphere"
2. A button on the Reflect page when intervention nudges are shown
3. A dedicated nav option or floating action button

When entering Atmosphere, the bottom nav bar and status bar HIDE completely. It's a full-screen immersive experience. The user exits by tapping anywhere and holding for 1 second (show a subtle "Hold to exit" hint that fades after 3 seconds).

## Visual Engine — HTML Canvas + requestAnimationFrame

Build the visual layer using HTML Canvas API (2D context). The entire visual is parameterised by mood values that change over time.

### Parameters (interpolated over the session duration)

```javascript
const sessionConfig = {
  durationMs: 5 * 60 * 1000, // 5 minutes
  
  // Starting values (derived from user's current mood)
  start: {
    baseHue: 220,        // from user's colour pick, converted to HSL hue
    saturation: 30,      // lower = more muted/grey
    brightness: 15,      // lower = darker
    speed: 0.3,          // animation speed multiplier (slower = heavier mood)
    complexity: 3,       // number of flowing forms
    breathRate: 5.5,     // breaths per minute (constant throughout)
    audioFreqBase: 80,   // Hz — lower = deeper/heavier
    audioFilterCutoff: 400, // Hz — lower = more muffled
    audioVolume: 0.3,
  },
  
  // Ending values (10-15% lighter than start)
  end: {
    baseHue: null,       // shift 15-20 degrees toward warm (toward 40-60)
    saturation: 45,      // slightly more vivid
    brightness: 25,      // noticeably lighter
    speed: 0.5,          // slightly more alive
    complexity: 5,       // more forms = more visual richness
    breathRate: 5.5,     // stays the same — grounding constant
    audioFreqBase: 150,  // higher = lighter
    audioFilterCutoff: 800, // more open = brighter sound
    audioVolume: 0.25,   // slightly quieter as it becomes lighter
  }
};
```

### Deriving Start Parameters from User Data

```javascript
function getAtmosphereParams(userColourHex, moodScore, dominantEmotion) {
  const hsl = hexToHSL(userColourHex);
  
  const start = {
    baseHue: hsl.h,
    saturation: Math.max(15, hsl.s * 0.6),  // desaturate slightly
    brightness: 10 + (moodScore * 20),       // darker for lower mood
    speed: 0.2 + (moodScore * 0.4),          // slower for lower mood
    complexity: 2 + Math.floor(moodScore * 4),
    breathRate: 5.5,
    audioFreqBase: 60 + (moodScore * 120),
    audioFilterCutoff: 200 + (moodScore * 800),
    audioVolume: 0.3,
  };
  
  // End state: shift toward warmer, lighter, more open
  const end = {
    baseHue: lerpHueTowardWarm(start.baseHue, 0.15), // 15% toward warm
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
```

### Visual Rendering — Flowing Organic Forms

Use simplex noise (or Perlin noise) to create slowly morphing organic blob shapes. Each "form" is a closed path whose control points are displaced by noise.

```javascript
// Install simplex-noise: npm install simplex-noise
import { createNoise3D } from 'simplex-noise';

const noise3D = createNoise3D();

function drawAtmosphere(ctx, width, height, params, elapsedMs) {
  const t = elapsedMs / 1000; // time in seconds
  
  // Breathing cycle — sine wave at breathRate
  const breathCycle = Math.sin(t * params.breathRate * Math.PI / 30);
  // breathCycle goes -1 to 1, maps to expansion/contraction
  
  // Clear with deep background
  const bgColor = `hsl(${params.baseHue}, ${params.saturation * 0.3}%, ${params.brightness * 0.4}%)`;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  // Draw flowing forms
  for (let i = 0; i < params.complexity; i++) {
    const formPhase = (i / params.complexity) * Math.PI * 2;
    
    // Center position drifts slowly
    const cx = width / 2 + Math.sin(t * params.speed * 0.1 + formPhase) * width * 0.15;
    const cy = height / 2 + Math.cos(t * params.speed * 0.08 + formPhase) * height * 0.1;
    
    // Base radius breathes with the breathing cycle
    const baseRadius = (height * 0.15) + (breathCycle * height * 0.03);
    
    // Draw blob using noise-displaced circle
    ctx.beginPath();
    const points = 64;
    for (let p = 0; p <= points; p++) {
      const angle = (p / points) * Math.PI * 2;
      const noiseVal = noise3D(
        Math.cos(angle) * 0.5 + i,
        Math.sin(angle) * 0.5 + i,
        t * params.speed * 0.15
      );
      const r = baseRadius * (0.7 + i * 0.15) + noiseVal * baseRadius * 0.4;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (p === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    
    // Fill with mood-coloured gradient
    const hueShift = i * 20;
    const alpha = 0.08 + (i * 0.03); // layered transparency
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 1.5);
    gradient.addColorStop(0, `hsla(${params.baseHue + hueShift}, ${params.saturation}%, ${params.brightness + 10}%, ${alpha + 0.05})`);
    gradient.addColorStop(1, `hsla(${params.baseHue + hueShift}, ${params.saturation * 0.5}%, ${params.brightness}%, 0)`);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
  
  // Central glow that breathes — the heart of the atmosphere
  const glowRadius = height * 0.2 + breathCycle * height * 0.04;
  const glowGradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, glowRadius
  );
  glowGradient.addColorStop(0, `hsla(${params.baseHue}, ${params.saturation + 10}%, ${params.brightness + 15}%, 0.12)`);
  glowGradient.addColorStop(0.5, `hsla(${params.baseHue}, ${params.saturation}%, ${params.brightness + 5}%, 0.05)`);
  glowGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, width, height);
  
  // Subtle particle dust (tiny dots drifting upward — signals of lightness)
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
```

### Animation Loop

```javascript
function startAtmosphere(canvas, startParams, endParams, durationMs, onComplete) {
  const ctx = canvas.getContext('2d');
  const startTime = performance.now();
  
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  
  // Use ease-in-out for imperceptible transition
  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  
  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    const easedProgress = easeInOut(progress);
    
    // Interpolate all parameters
    const currentParams = {};
    for (const key of Object.keys(startParams)) {
      currentParams[key] = lerp(startParams[key], endParams[key], easedProgress);
    }
    
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    drawAtmosphere(ctx, canvas.clientWidth, canvas.clientHeight, currentParams, elapsed);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Session complete — hold at end state
      function holdEnd(now2) {
        const elapsed2 = now2 - startTime;
        drawAtmosphere(ctx, canvas.clientWidth, canvas.clientHeight, endParams, elapsed2);
        requestAnimationFrame(holdEnd);
      }
      requestAnimationFrame(holdEnd);
      if (onComplete) onComplete();
    }
  }
  
  requestAnimationFrame(animate);
}
```

---

## Audio Engine — Web Audio API

Generate ambient soundscapes in real-time. No audio files needed.

### Sound Design

Create a layered ambient sound using Web Audio API oscillators and effects:

```javascript
function createAtmosphereAudio(audioCtx, startParams, endParams, durationMs) {
  // Layer 1: Deep drone (foundation)
  const drone = audioCtx.createOscillator();
  drone.type = 'sine';
  drone.frequency.value = startParams.audioFreqBase;
  // Ramp to end value over duration
  drone.frequency.linearRampToValueAtTime(
    endParams.audioFreqBase,
    audioCtx.currentTime + durationMs / 1000
  );
  
  // Layer 2: Harmonic shimmer (overtone, adds warmth)
  const shimmer = audioCtx.createOscillator();
  shimmer.type = 'sine';
  shimmer.frequency.value = startParams.audioFreqBase * 3; // 3rd harmonic
  shimmer.frequency.linearRampToValueAtTime(
    endParams.audioFreqBase * 3,
    audioCtx.currentTime + durationMs / 1000
  );
  
  // Layer 3: Very slow LFO modulating volume (breathing feel)
  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = startParams.breathRate / 60; // Convert BPM to Hz
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 0.1; // Subtle volume modulation
  lfo.connect(lfoGain);
  
  // Low-pass filter (controls brightness/muffle)
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = startParams.audioFilterCutoff;
  filter.frequency.linearRampToValueAtTime(
    endParams.audioFilterCutoff,
    audioCtx.currentTime + durationMs / 1000
  );
  filter.Q.value = 1;
  
  // Reverb using convolver (create impulse response)
  const convolver = audioCtx.createConvolver();
  const reverbLength = 3; // seconds
  const sampleRate = audioCtx.sampleRate;
  const impulse = audioCtx.createBuffer(2, sampleRate * reverbLength, sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }
  }
  convolver.buffer = impulse;
  
  // Master gain (volume control + fade in/out)
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0;
  // Fade in over 3 seconds
  masterGain.gain.linearRampToValueAtTime(
    startParams.audioVolume,
    audioCtx.currentTime + 3
  );
  // Gradual volume shift over session
  masterGain.gain.linearRampToValueAtTime(
    endParams.audioVolume,
    audioCtx.currentTime + durationMs / 1000
  );
  
  // Connect the graph
  // Drone → filter → convolver → master → output
  drone.connect(filter);
  shimmer.connect(filter);
  filter.connect(convolver);
  filter.connect(masterGain); // dry signal
  convolver.connect(masterGain); // wet signal
  lfoGain.connect(masterGain.gain); // LFO modulates master volume
  masterGain.connect(audioCtx.destination);
  
  // Start all oscillators
  drone.start();
  shimmer.start();
  lfo.start();
  
  return {
    stop: () => {
      // Fade out over 2 seconds
      masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2);
      setTimeout(() => {
        drone.stop();
        shimmer.stop();
        lfo.stop();
      }, 2500);
    }
  };
}
```

### Audio Initialisation Note
Web Audio requires user gesture to start. Trigger audioCtx creation on the "Enter Atmosphere" button click:
```javascript
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
```

---

## React Component: AtmospherePage.jsx

```jsx
// Key structure — implement fully:

export default function AtmospherePage() {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [holdingToExit, setHoldingToExit] = useState(false);
  const audioRef = useRef(null);
  
  // Get user's current mood data from the most recent check-in
  // or from Spotify analysis moodScore
  
  function startSession() {
    setIsActive(true);
    // Hide nav bar
    // Go full screen within the device frame
    // Calculate params from user mood data
    // Start visual engine
    // Start audio engine
    // Start elapsed timer
  }
  
  function endSession() {
    // Fade out audio
    audioRef.current?.stop();
    setIsActive(false);
    // Log the session: duration, starting mood params, ending params
    // Show a soft summary card:
    // "You spent X minutes in Atmosphere. 
    //  You entered with [colour]. The environment shifted to [lighter colour]."
    // Save to entry history
  }
  
  // Hold-to-exit: onTouchStart / onMouseDown starts a 1-second timer
  // If held for 1 second, trigger endSession
  // Show a circular progress indicator during the hold
  // onTouchEnd / onMouseUp cancels the timer
  
  // Timer display: subtle, bottom-center, showing elapsed time
  // in format "2:34" — very small, low opacity, doesn't distract
  
  // Breathing guide hint: very subtle text "breathe with the rhythm"
  // that fades in at 10 seconds and fades out at 20 seconds
  // Never appears again — just a gentle initial hint
}
```

---

## Entry Points

### 1. Express Page — Post Check-In (low mood)
After saving a check-in, if the mood indicators suggest low mood (dark colour, low Spotify valence, heavy metaphor), show:

A card that says:
"It sounds heavy today. Want to step into Atmosphere for a few minutes?"
[Enter Atmosphere] button — soft, glowing, pill-shaped

Only show this when mood is notably low. Don't show it on neutral or positive days.

### 2. Reflect Page — During Intervention Nudges
When the reflect page shows intervention nudges (3+ consecutive low days), add an Atmosphere option:

"Sometimes you don't need to think — you just need to feel held. Atmosphere creates a space that meets you where you are."
[Enter Atmosphere] button

### 3. Echoes Page — Contextual
After reading Echo cards during a low period, offer:

"Need a moment? Atmosphere is here."
Small, subtle link — not pushy.

---

## Post-Session Summary

After exiting Atmosphere, show a beautiful summary card (before returning to the main app):

- Duration: "5 minutes 23 seconds"
- Visual: Two colour circles side by side — entry colour and exit colour 
  (the exit colour is the shifted/warmer colour from the end of the session)
- Text: "You entered with [deep slate blue]. The atmosphere shifted to [soft teal]. 
  Sometimes just being still is enough."
- A "Save to journal" button that logs this as a special entry type in their timeline
- The entry shows up on the Reflect page as a distinct card with a 
  special "Atmosphere session" icon

---

## Visual Style Notes

- The Atmosphere page must be TRULY full-screen — no nav bar, no status bar, 
  no UI elements except the subtle timer and the exit hint
- The canvas fills the entire device screen
- The only text overlay: the elapsed timer (bottom center, 12px, 20% opacity) 
  and the initial breathing hint (center, 14px, fades in and out once)
- The hold-to-exit indicator: a thin circular ring that fills clockwise 
  over 1 second around the user's touch point
- Transition INTO Atmosphere: 1-second fade to black, then the visual 
  fades in over 2 seconds
- Transition OUT: 2-second fade to black, then the summary card fades in

---

## Dependencies

```bash
npm install simplex-noise
```

No other dependencies needed. Web Audio API and Canvas API are built into browsers.

---

## Demo Tip

For the hackathon video demo, speed up the 5-minute session to show the 
full arc in ~30 seconds using a demo mode:

```javascript
const DEMO_MODE = true;
const sessionDuration = DEMO_MODE ? 30 * 1000 : 5 * 60 * 1000;
```

This lets you show the full visual+audio shift from dark to lighter 
in the 2-minute video without waiting 5 real minutes.
