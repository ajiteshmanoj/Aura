import { useRef, useEffect, useMemo, useState } from 'react';
import { getEntries } from '../data/store';
import { hexToRgb } from '../utils/colour';

export default function Canvas() {
  const canvasRef = useRef(null);
  const entries = useMemo(() => getEntries(), []);
  const [generated, setGenerated] = useState(false);

  const colours = entries.map(e => e.colour).filter(Boolean);
  const metaphors = entries.map(e => e.metaphor).filter(Boolean);
  const songs = entries.map(e => e.songName).filter(Boolean);
  const valences = entries.map(e => e.songFeatures?.valence).filter(v => v != null);

  useEffect(() => {
    if (!canvasRef.current || colours.length === 0) return;
    generateCanvas();
  }, []);

  const generateCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 800;
    const h = canvas.height = 1000;

    // Background gradient from the month's colours
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    const blendColours = colours.length > 0 ? colours : ['#1a1b24'];
    blendColours.forEach((c, i) => {
      gradient.addColorStop(i / Math.max(1, blendColours.length - 1), c);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Darken overlay for text readability
    ctx.fillStyle = 'rgba(10, 11, 16, 0.4)';
    ctx.fillRect(0, 0, w, h);

    // Flowing curves influenced by valence
    for (let i = 0; i < 8; i++) {
      const valence = valences[i % valences.length] || 0.5;
      const colour = colours[i % colours.length] || '#5ab5a0';
      const { r, g, b } = hexToRgb(colour);

      ctx.beginPath();
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.15 + valence * 0.2})`;
      ctx.lineWidth = 2 + valence * 4;

      const startY = (h / 8) * i + Math.random() * 60;
      ctx.moveTo(0, startY);

      for (let x = 0; x < w; x += 20) {
        const y = startY + Math.sin(x * 0.005 + i) * (50 + valence * 80) + Math.cos(x * 0.01 + i * 2) * 30;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Abstract circles from colour picks
    colours.forEach((c, i) => {
      const { r, g, b } = hexToRgb(c);
      const valence = valences[i] || 0.5;
      const x = 100 + Math.random() * (w - 200);
      const y = 100 + Math.random() * (h - 400);
      const radius = 30 + valence * 80;

      const radGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      radGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
      radGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.beginPath();
      ctx.fillStyle = radGrad;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Soft particle field
    for (let i = 0; i < 100; i++) {
      const c = colours[i % colours.length] || '#5ab5a0';
      const { r, g, b } = hexToRgb(c);
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.1 + Math.random() * 0.15})`;
      ctx.arc(x, y, 1 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Metaphor text overlay
    ctx.textAlign = 'center';
    const selectedMetaphors = metaphors.slice(0, 5);
    selectedMetaphors.forEach((m, i) => {
      const fontSize = 14 + Math.random() * 10;
      ctx.font = `italic ${fontSize}px 'Playfair Display', serif`;
      const opacity = 0.3 + Math.random() * 0.4;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      const x = 100 + Math.random() * (w - 200);
      const y = 200 + (i * (h - 400)) / Math.max(1, selectedMetaphors.length - 1);
      ctx.fillText(`"${m}"`, x, y);
    });

    // Song titles subtly woven in
    ctx.font = '10px "DM Sans", sans-serif';
    const uniqueSongs = [...new Set(songs)].slice(0, 6);
    uniqueSongs.forEach((s, i) => {
      ctx.fillStyle = `rgba(255, 255, 255, 0.12)`;
      const x = 50 + Math.random() * (w - 100);
      const y = 150 + Math.random() * (h - 300);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.3);
      ctx.fillText(s, 0, 0);
      ctx.restore();
    });

    // Title
    ctx.textAlign = 'center';
    ctx.font = '600 28px "Playfair Display", serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    ctx.fillText(month, w / 2, h - 60);

    ctx.font = '12px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillText('Your Aura', w / 2, h - 35);

    setGenerated(true);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `aura-canvas-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-dvh pb-24 px-5 pt-6 max-w-lg mx-auto page-enter">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-white mb-1">Canvas</h1>
        <p className="text-sm text-gray-500">Your month as art</p>
      </div>

      {colours.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">Start expressing to create your canvas</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden shadow-2xl animate-bloom">
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ aspectRatio: '4/5' }}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={generateCanvas}
              className="flex-1 py-3 rounded-xl glass text-gray-400 hover:text-white transition-all text-sm"
            >
              Regenerate
            </button>
            <button
              onClick={handleExport}
              className="flex-1 py-3 rounded-xl bg-aura-amber/20 text-aura-amber text-sm font-medium transition-all hover:bg-aura-amber/30"
            >
              Share as PNG
            </button>
          </div>

          {/* Gallery of past months (mock) */}
          <div className="mt-8">
            <h2 className="font-serif text-lg text-white mb-3">Gallery</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { month: 'February 2026', colours: ['#5ab5a0', '#7a8fa6', '#d4a76a'] },
                { month: 'January 2026', colours: ['#6b5b95', '#a8c5b8', '#e8b87a'] },
              ].map((item) => (
                <div
                  key={item.month}
                  className="aspect-[4/5] rounded-xl overflow-hidden relative cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${item.colours.join(', ')})`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/30 flex items-end p-3">
                    <span className="text-xs text-white/70">{item.month}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
