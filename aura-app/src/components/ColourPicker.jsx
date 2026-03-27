import { useRef, useState, useEffect, useCallback } from 'react';

export default function ColourPicker({ value, onChange }) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, size, size);

    // Draw circular HSL colour wheel
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = (angle + 1) * Math.PI / 180;

      for (let r = 0; r < radius; r++) {
        const saturation = (r / radius) * 100;
        ctx.beginPath();
        ctx.arc(center, center, r, startAngle, endAngle);
        ctx.strokeStyle = `hsl(${angle}, ${saturation}%, ${50 + (1 - r / radius) * 20}%)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Draw inner dark circle for depth
    const innerGrad = ctx.createRadialGradient(center, center, 0, center, center, radius * 0.15);
    innerGrad.addColorStop(0, 'rgba(10,10,26,0.6)');
    innerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const pickColour = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const size = rect.width;
    const center = size / 2;

    const dx = x - center;
    const dy = y - center;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = center - 8;

    if (dist > radius + 10) return;

    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle < 0) angle += 360;

    const saturation = Math.min(100, (dist / radius) * 100);
    const lightness = 50 + (1 - dist / radius) * 20;

    const hex = hslToHex(angle, saturation, lightness);
    onChange(hex);
  }, [onChange]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    pickColour(e.clientX, e.clientY);
  };
  const handlePointerMove = (e) => {
    if (isDragging) pickColour(e.clientX, e.clientY);
  };
  const handlePointerUp = () => setIsDragging(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      {/* Circular colour wheel */}
      <div style={{ position: 'relative', width: '220px', height: '220px' }}>
        <canvas
          ref={canvasRef}
          width={440}
          height={440}
          style={{
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            cursor: 'crosshair',
            touchAction: 'none',
            boxShadow: value
              ? `0 0 40px ${value}30, 0 0 80px ${value}15`
              : '0 0 40px rgba(245,166,35,0.1)',
            transition: 'box-shadow 0.5s ease',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        {/* Center preview */}
        {value && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: value,
              border: '3px solid rgba(255,255,255,0.2)',
              boxShadow: `0 0 24px ${value}60, 0 0 48px ${value}30`,
              pointerEvents: 'none',
              animation: 'softPulse 3s ease-in-out infinite',
            }}
          />
        )}
      </div>

      {/* Selected colour label */}
      {value && (
        <span style={{ fontSize: '13px', color: '#6B6777', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
          {value}
        </span>
      )}
    </div>
  );
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
