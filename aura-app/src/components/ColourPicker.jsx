import { useRef, useState, useEffect, useCallback } from 'react';

export default function ColourPicker({ value, onChange }) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pickerPos, setPickerPos] = useState({ x: 0.5, y: 0.5 });
  const [hue, setHue] = useState(180);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Draw saturation-lightness gradient
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const s = (x / w) * 100;
        const l = 100 - (y / h) * 100;
        ctx.fillStyle = `hsl(${hue}, ${s}%, ${l}%)`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [hue]);

  const pickColour = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    setPickerPos({ x, y });

    const s = Math.round(x * 100);
    const l = Math.round(100 - y * 100);
    const hex = hslToHex(hue, s, l);
    onChange(hex);
  }, [hue, onChange]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    pickColour(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    pickColour(e.clientX, e.clientY);
  };

  const handlePointerUp = () => setIsDragging(false);

  return (
    <div className="space-y-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={200}
          className="w-full h-48 rounded-2xl cursor-crosshair colour-wheel shadow-lg"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        {/* Picker indicator */}
        <div
          className="absolute w-6 h-6 rounded-full border-2 border-white shadow-lg pointer-events-none transition-transform duration-75"
          style={{
            left: `calc(${pickerPos.x * 100}% - 12px)`,
            top: `calc(${pickerPos.y * 100}% - 12px)`,
            backgroundColor: value || '#5ab5a0',
            boxShadow: `0 0 20px ${value || '#5ab5a0'}60`,
          }}
        />
      </div>

      {/* Hue slider */}
      <input
        type="range"
        min="0"
        max="360"
        value={hue}
        onChange={(e) => {
          setHue(Number(e.target.value));
          const s = Math.round(pickerPos.x * 100);
          const l = Math.round(100 - pickerPos.y * 100);
          onChange(hslToHex(Number(e.target.value), s, l));
        }}
        className="w-full h-3 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right,
            hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%),
            hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))`,
        }}
      />

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

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
