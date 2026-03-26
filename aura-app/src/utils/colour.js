export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substr(0, 2), 16),
    g: parseInt(h.substr(2, 2), 16),
    b: parseInt(h.substr(4, 2), 16),
  };
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function getColourBrightness(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export function getColourMood(hex) {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  if (l < 25) return 'deep';
  if (l > 75 && s > 30) return 'bright';
  if (s < 15) return 'muted';
  if (h >= 0 && h < 30) return 'warm';
  if (h >= 30 && h < 90) return 'golden';
  if (h >= 90 && h < 150) return 'fresh';
  if (h >= 150 && h < 210) return 'cool';
  if (h >= 210 && h < 270) return 'calm';
  if (h >= 270 && h < 330) return 'gentle';
  return 'warm';
}

export function blendColours(colours) {
  if (!colours.length) return '#5ab5a0';
  const total = colours.length;
  const sum = colours.reduce(
    (acc, hex) => {
      const { r, g, b } = hexToRgb(hex);
      return { r: acc.r + r, g: acc.g + g, b: acc.b + b };
    },
    { r: 0, g: 0, b: 0 }
  );
  const r = Math.round(sum.r / total).toString(16).padStart(2, '0');
  const g = Math.round(sum.g / total).toString(16).padStart(2, '0');
  const b = Math.round(sum.b / total).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}
