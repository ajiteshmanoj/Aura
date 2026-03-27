# Aura Aesthetic Overhaul — Make It Beautiful

Read every file in the project first. The app works functionally but looks boring and flat. Nobody would want to open this app. I need it to feel like a premium, aesthetic wellness app — the kind Gen Z screenshots and posts on Instagram. Think: Spotify Wrapped meets a meditation retreat meets a gallery exhibition.

## Design Philosophy

The current dark flat background with muted colours feels lifeless. We need DEPTH, WARMTH, and LIFE. The app should feel like a living, breathing space — not a form on a dark page.

Reference aesthetic: imagine if Spotify's year-end Wrapped, the Calm app, and a neon-lit Tokyo alley had a baby. Rich, layered, warm but with moments of vivid colour.

## Colour System Overhaul

REMOVE the flat dark navy everywhere. Replace with a LAYERED background system:

### Base Layer (every page)
```css
background: linear-gradient(160deg, #0a0a1a 0%, #0d1117 40%, #111827 100%);
```

### Ambient Layer
A large, soft, blurred colour orb that shifts based on the user's last selected colour. This creates a different atmospheric feel every time they open the app:
```css
/* Pseudo-element behind content */
.ambient-glow {
  position: fixed;
  top: -20%;
  right: -20%;
  width: 60%;
  height: 60%;
  background: radial-gradient(circle, {userColour}33 0%, transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  animation: drift 20s ease-in-out infinite alternate;
}

/* Second smaller orb, bottom-left, complementary colour */
.ambient-glow-2 {
  position: fixed;
  bottom: -15%;
  left: -15%;
  width: 40%;
  height: 40%;
  background: radial-gradient(circle, {complementaryColour}22 0%, transparent 70%);
  filter: blur(60px);
  animation: drift 25s ease-in-out infinite alternate-reverse;
}
```

### Accent Colours — Make Them POP
Replace the muted amber/coral with richer, more vibrant accents:
- Primary accent: warm golden amber #F5A623 → make it glow with text-shadow
- Secondary: soft lavender #B8A9FF
- Tertiary: rose pink #FF6B8A
- Success/positive: mint #6EECD4
- Calm: sky blue #7EB8FF

Use these strategically — headings get golden amber, interactive elements get lavender, Echo cards get rose accents, positive states get mint.

### Text Colours
- Primary text: #F0EDE6 (warm off-white, NOT pure white)
- Secondary text: #9B97A0 (soft grey-lavender, not boring grey)
- Muted/hint text: #6B6777

## Card & Container Design

Every card must feel like a premium frosted glass panel:

```css
.glass-card {
  background: linear-gradient(
    135deg, 
    rgba(255, 255, 255, 0.05) 0%, 
    rgba(255, 255, 255, 0.02) 100%
  );
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
```

Add a SUBTLE gradient border effect on hover:
```css
.glass-card:hover {
  border-color: rgba(245, 166, 35, 0.15);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(245, 166, 35, 0.1);
}
```

## Page-by-Page Aesthetic Fixes

### EXPRESS PAGE
1. **Colour Picker**: Replace the grid of colour swatches with a CIRCULAR colour wheel. It should feel like painting, not selecting from a spreadsheet. Use a radial HSL gradient rendered on a canvas element. The user drags on the wheel to pick a colour. A bright dot follows their finger. The selected colour pulses with a soft glow.

2. **After picking a colour**: The ambient background glow should IMMEDIATELY shift to match the selected colour. This creates the feeling that the app is responding to your emotions — the whole atmosphere changes.

3. **Song search results**: Each result row should show album art with a soft glow matching the album art's dominant colour. On hover, the row lifts slightly with a scale transform.

4. **Metaphor input**: Style it as a beautiful quote card — larger font (Playfair Display italic, 20px), centered text, with a subtle decorative quotation mark (" ") above it in the accent colour at low opacity.

5. **Save button**: A pill-shaped button with a gradient that matches the selected colour. Should have a gentle pulse animation when ready. When tapped, burst animation with particles dispersing outward in the selected colour.

6. **Section dividers**: Instead of just whitespace, add very subtle thin lines with a gradient fade (transparent → rgba(255,255,255,0.05) → transparent)

### REFLECT PAGE
1. **Colour ribbon**: Should be a beautiful horizontal gradient strip made from blending all the week's colour picks — not discrete swatches. It should look like a watercolour paint stroke.

2. **Calendar heatmap**: Each day cell should have rounded corners (12px) with a soft inner glow. Empty days should be barely visible outlines. Busy days should glow with warm amber/coral. The gradient should go from cool purple (empty) → warm amber (moderate) → hot coral/red (packed).

3. **Charts**: Any line chart or area chart should use gradient fills underneath the line (colour fading to transparent). Lines should be smooth curves (bezier), not straight segments. Add animated dots at data points that pulse gently.

4. **Entry timeline**: Each entry in the timeline should have its colour as a glowing left border accent. The metaphor text should be in Playfair Display italic. Show a small album art thumbnail next to the song name.

### ECHOES PAGE
1. **Echo cards** should feel like softly glowing messages floating in space. Each card gets a left border in the person's colour, and a very subtle background tint of that colour at 3% opacity.

2. **Filter pills** at the top: rounded pills with a gradient fill when active (golden amber → rose), outlined with no fill when inactive. Smooth transition between states.

3. When cards load, they should cascade in with a staggered fade-up animation (each card 80ms after the previous one, translateY 20px → 0, opacity 0 → 1).

4. The contribution prompt card should have a special treatment — a double border (outer glow in golden amber) to make it feel like an invitation.

### CANVAS PAGE
1. The monthly canvas artwork should be the hero — large, taking up most of the screen, with a subtle frame/border treatment (like a gallery frame — thin line with spacing).

2. "Regenerate" and "Share" buttons should be minimal, pill-shaped, positioned below the canvas with proper spacing.

3. The gallery thumbnails for past months should have a soft parallax hover effect (slight tilt/scale on hover).

### REPORT PAGE
1. The weekly colour palette should render as smooth blended circles overlapping slightly (like a colour palette swatch), not as blocks.

2. Each insight section should have a distinct subtle icon or accent:
   - Pattern: a subtle wave icon or line pattern
   - Music: a note icon
   - Metaphor: quotation marks
   - Reflection: a subtle mirror/circle icon

3. The reflection section at the bottom should stand out — use a slightly different card style, perhaps with a golden amber border-left accent and italic Playfair Display text.

### PLAYLISTS PAGE
1. Album art should have a subtle glow matching the dominant colour of the artwork.
2. The playlist header should show a 2x2 mosaic of album covers with rounded corners.
3. Track rows should have subtle hover states with a left-sliding colour accent.

### LANDING PAGE
1. The tagline should animate in word-by-word with a soft fade + slight upward movement. Each word should have a slight colour shift: "Express" in golden amber, "feel" in rose, "See" in lavender, "alone" in mint.

2. Background should have 2-3 large blurred colour orbs slowly drifting and morphing (CSS animation, 30s+ duration, very subtle).

3. The connect buttons (Spotify, Calendar) should have proper brand colours with soft glow effects.

## Global Animations

Add these CSS keyframes and apply them throughout:

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes drift {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(30px, -20px) scale(1.1); }
}

@keyframes softPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.03); }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
```

- Every page: content fades in with fadeInUp, staggered by child index
- Cards: stagger-animate with 80ms delay between siblings  
- Interactive elements: soft scale on hover (1.02), press (0.98)
- Page transitions: crossfade (opacity 0→1, 300ms)

## Typography Polish

- All headings: Playfair Display, weight 600, letter-spacing: -0.02em
- Section subtitles: DM Sans, weight 400, colour: secondary text, letter-spacing: 0.02em
- Metaphor/quote text: Playfair Display italic, slightly larger (18-20px)
- Button text: DM Sans, weight 600, letter-spacing: 0.05em, text-transform: uppercase for primary actions

## Bottom Nav Bar
- Background: rgba(10, 10, 26, 0.85) with backdrop-filter blur(24px)
- Active tab: icon in golden amber with a small glowing dot indicator below
- Inactive tabs: icons in muted grey (#6B6777)
- Smooth transition when switching tabs (colour, dot appear/disappear)
- Subtle top border: 1px solid rgba(255, 255, 255, 0.04)

## Final Rule
Every screen should feel like you could screenshot it and it would look beautiful as a wallpaper. If a section looks "boring" or "flat", add depth through: ambient colour, glassmorphism, gradient accents, or subtle animation. The app should feel ALIVE.
