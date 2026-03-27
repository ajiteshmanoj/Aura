import { useState } from 'react';

// Curated palette: rows = hue families, columns = light → dark shades
const PALETTE = [
  // Reds / Warm
  ['#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#e53935', '#c62828', '#b71c1c'],
  // Corals / Orange
  ['#ffccbc', '#ffab91', '#ff8a65', '#ff7043', '#f4511e', '#d84315', '#bf360c'],
  // Ambers / Yellow
  ['#fff9c4', '#fff176', '#ffee58', '#fdd835', '#f9a825', '#f57f17', '#e65100'],
  // Greens
  ['#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#43a047', '#2e7d32', '#1b5e20'],
  // Teals
  ['#b2dfdb', '#80cbc4', '#4db6ac', '#26a69a', '#00897b', '#00695c', '#004d40'],
  // Blues
  ['#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#1e88e5', '#1565c0', '#0d47a1'],
  // Indigos
  ['#c5cae9', '#9fa8da', '#7986cb', '#5c6bc0', '#3949ab', '#283593', '#1a237e'],
  // Purples / Lavender
  ['#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#8e24aa', '#6a1b9a', '#4a148c'],
  // Pinks
  ['#f8bbd0', '#f48fb1', '#f06292', '#ec407a', '#d81b60', '#ad1457', '#880e4f'],
  // Neutrals / Greys
  ['#f5f5f5', '#bdbdbd', '#9e9e9e', '#757575', '#616161', '#424242', '#212121'],
];

export default function ColourPicker({ value, onChange }) {
  const [hoveredColour, setHoveredColour] = useState(null);

  return (
    <div className="space-y-4">
      {/* Colour grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {PALETTE.flat().map((hex) => {
          const isSelected = value === hex;
          return (
            <button
              key={hex}
              onClick={() => onChange(hex)}
              onMouseEnter={() => setHoveredColour(hex)}
              onMouseLeave={() => setHoveredColour(null)}
              className="aspect-square rounded-lg transition-all duration-200 border-2"
              style={{
                backgroundColor: hex,
                borderColor: isSelected ? '#fff' : 'transparent',
                transform: isSelected ? 'scale(1.15)' : hoveredColour === hex ? 'scale(1.08)' : 'scale(1)',
                boxShadow: isSelected ? `0 0 20px ${hex}60, 0 0 40px ${hex}30` : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Selected colour preview */}
      {value && (
        <div className="flex items-center gap-3 animate-bloom">
          <div
            className="w-10 h-10 rounded-xl shadow-lg transition-all duration-500"
            style={{
              backgroundColor: value,
              boxShadow: `0 0 30px ${value}40, 0 0 60px ${value}20`,
            }}
          />
          <span className="text-sm text-gray-400 font-mono">{value}</span>
        </div>
      )}
    </div>
  );
}
