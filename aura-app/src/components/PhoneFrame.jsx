import { useState, useEffect } from 'react';
import 'devices.css/dist/devices.min.css';

export default function PhoneFrame({ children, bottomNav }) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [ambientColour, setAmbientColour] = useState('#f0a050');

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth > 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const interval = setInterval(() => {
      try {
        const entries = JSON.parse(localStorage.getItem('aura_entries') || '[]');
        const last = entries[entries.length - 1];
        if (last?.colour) setAmbientColour(last.colour);
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [isDesktop]);

  // Mobile: render normally
  if (!isDesktop) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
        <div style={{ flex: 1 }}>{children}</div>
        {bottomNav}
      </div>
    );
  }

  // Desktop: render inside phone mockup
  return (
    <div
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #0d0d2a, #030308)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '40px',
        paddingBottom: '40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${ambientColour}26 0%, ${ambientColour}0d 50%, transparent 70%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'background 2s ease',
        }}
      />

      <div
        className="device device-iphone-14-pro device-black"
        style={{
          transform: 'scale(0.85)',
          transformOrigin: 'top center',
          zIndex: 1,
        }}
      >
        <div className="device-frame">
          <div
            className="device-screen"
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden',
              background: '#0a0b10',
              position: 'relative',
            }}
          >
            {/* iOS Status Bar */}
            <div
              style={{
                flexShrink: 0,
                height: '54px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: '0 28px 6px',
                background: 'rgba(10, 11, 16, 0.95)',
                backdropFilter: 'blur(20px)',
                zIndex: 100,
              }}
            >
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                9:41
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="17" height="12" viewBox="0 0 17 12" fill="white">
                  <rect x="0" y="9" width="3" height="3" rx="0.5" />
                  <rect x="4.5" y="6" width="3" height="6" rx="0.5" />
                  <rect x="9" y="3" width="3" height="9" rx="0.5" />
                  <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
                </svg>
                <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
                  <path d="M8 11.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" />
                  <path d="M4.93 7.82a4.5 4.5 0 016.14 0" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                  <path d="M2.4 5.3a8 8 0 0111.2 0" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                </svg>
                <svg width="27" height="12" viewBox="0 0 27 12" fill="none">
                  <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="white" strokeOpacity="0.35" />
                  <rect x="2" y="2" width="18" height="8" rx="1.5" fill="white" />
                  <path d="M24 4v4a2 2 0 000-4z" fill="white" fillOpacity="0.4" />
                </svg>
              </div>
            </div>

            {/* Scrollable page content */}
            <div
              id="phone-scroll-area"
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none',
              }}
            >
              {children}
            </div>

            {/* Bottom nav — fixed at bottom of phone, outside scroll */}
            {bottomNav && (
              <div
                style={{
                  flexShrink: 0,
                  background: 'rgba(10, 11, 16, 0.9)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {bottomNav}
              </div>
            )}
          </div>
        </div>
        <div className="device-stripe"></div>
        <div className="device-header"></div>
        <div className="device-sensors"></div>
        <div className="device-btns"></div>
        <div className="device-power"></div>
        <div className="device-home"></div>
      </div>

      <style>{`
        #phone-scroll-area::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
