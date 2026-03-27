import { useRef, useEffect, useMemo, useState } from 'react';
import { getEntries } from '../data/store';
import { hexToRgb } from '../utils/colour';

export default function Canvas() {
  const canvasRef = useRef(null);
  const entries = useMemo(() => getEntries(), []);

  const colours = entries.map(e => e.colour).filter(Boolean);
  const metaphors = entries.map(e => e.metaphor).filter(Boolean);
  const songs = entries.map(e => e.songName).filter(Boolean);
  const valences = entries.map(e => e.songFeatures?.valence).filter(v => v != null);

  useEffect(() => {
    if (canvasRef.current && colours.length > 0) generateCanvas();
  }, []);

  const generateCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 800;
    const h = canvas.height = 1000;

    const gradient = ctx.createLinearGradient(0, 0, w, h);
    colours.forEach((c, i) => gradient.addColorStop(i / Math.max(1, colours.length - 1), c));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(10, 10, 26, 0.35)';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 8; i++) {
      const valence = valences[i % valences.length] || 0.5;
      const colour = colours[i % colours.length] || '#F5A623';
      const { r, g, b } = hexToRgb(colour);
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.12 + valence * 0.2})`;
      ctx.lineWidth = 2 + valence * 4;
      const startY = (h / 8) * i + Math.random() * 60;
      ctx.moveTo(0, startY);
      for (let x = 0; x < w; x += 10) {
        const y = startY + Math.sin(x * 0.004 + i) * (50 + valence * 80) + Math.cos(x * 0.008 + i * 2) * 30;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    colours.forEach((c, i) => {
      const { r, g, b } = hexToRgb(c);
      const valence = valences[i] || 0.5;
      const x = 100 + Math.random() * (w - 200);
      const y = 100 + Math.random() * (h - 400);
      const radius = 30 + valence * 80;
      const radGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      radGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
      radGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.beginPath(); ctx.fillStyle = radGrad;
      ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    });

    for (let i = 0; i < 120; i++) {
      const c = colours[i % colours.length] || '#F5A623';
      const { r, g, b } = hexToRgb(c);
      ctx.beginPath();
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.08 + Math.random() * 0.15})`;
      ctx.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = 'center';
    metaphors.slice(0, 5).forEach((m, i) => {
      const fontSize = 14 + Math.random() * 10;
      ctx.font = `italic ${fontSize}px 'Playfair Display', serif`;
      ctx.fillStyle = `rgba(240, 237, 230, ${0.25 + Math.random() * 0.35})`;
      ctx.fillText(`"${m}"`, 100 + Math.random() * (w - 200), 200 + (i * (h - 400)) / Math.max(1, 4));
    });

    ctx.font = '10px "DM Sans", sans-serif';
    [...new Set(songs)].slice(0, 6).forEach((s) => {
      ctx.fillStyle = 'rgba(240, 237, 230, 0.1)';
      ctx.save();
      const x = 50 + Math.random() * (w - 100), y = 150 + Math.random() * (h - 300);
      ctx.translate(x, y); ctx.rotate((Math.random() - 0.5) * 0.3);
      ctx.fillText(s, 0, 0); ctx.restore();
    });

    ctx.textAlign = 'center';
    ctx.font = '600 28px "Playfair Display", serif';
    ctx.fillStyle = 'rgba(240, 237, 230, 0.65)';
    ctx.fillText(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), w / 2, h - 60);
    ctx.font = '12px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(240, 237, 230, 0.25)';
    ctx.fillText('Your Aura', w / 2, h - 35);
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
    <div className="pb-24 px-5 pt-6 min-h-dvh max-w-lg mx-auto page-enter">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 600, color: '#F0EDE6', letterSpacing: '-0.02em', margin: '0 0 4px' }}>Canvas</h1>
        <p style={{ fontSize: '13px', color: '#6B6777', margin: 0 }}>Your month as art</p>
      </div>

      {colours.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: '#6B6777' }}>Start expressing to create your canvas</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Gallery frame effect */}
          <div style={{
            borderRadius: '20px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)', padding: '6px', background: 'rgba(255,255,255,0.02)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            animation: 'bloom 0.6s ease-out both',
          }}>
            <canvas ref={canvasRef} style={{ width: '100%', borderRadius: '16px', aspectRatio: '4/5', display: 'block' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={generateCanvas} style={{
              flex: 1, padding: '12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)',
              background: 'transparent', color: '#9B97A0', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
            }}>
              Regenerate
            </button>
            <button onClick={handleExport} style={{
              flex: 1, padding: '12px', borderRadius: '14px', border: 'none',
              background: 'rgba(245,166,35,0.15)', color: '#F5A623', fontSize: '13px', cursor: 'pointer', fontWeight: 600,
            }}>
              Share as PNG
            </button>
          </div>

          {/* Gallery */}
          <div style={{ marginTop: '16px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', color: '#F0EDE6', marginBottom: '12px' }}>Gallery</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { month: 'February 2026', colours: ['#5ab5a0', '#7a8fa6', '#d4a76a'] },
                { month: 'January 2026', colours: ['#6b5b95', '#a8c5b8', '#e8b87a'] },
              ].map((item) => (
                <div key={item.month} style={{
                  aspectRatio: '4/5', borderRadius: '16px', overflow: 'hidden', position: 'relative', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${item.colours.join(', ')})`,
                  transition: 'transform 0.3s', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03) rotate(1deg)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'flex-end', padding: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(240,237,230,0.7)' }}>{item.month}</span>
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
