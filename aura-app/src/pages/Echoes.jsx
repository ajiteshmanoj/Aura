import { useState, useMemo } from 'react';
import { echoCards, matchEchoes } from '../data/echoCards';
import { getEntries } from '../data/store';

export default function Echoes() {
  const entries = useMemo(() => getEntries(), []);
  const latestEntry = entries[entries.length - 1];
  const [filter, setFilter] = useState('all');
  const [showContribute, setShowContribute] = useState(false);
  const [contribution, setContribution] = useState('');
  const [contributed, setContributed] = useState(false);

  const displayedEchoes = useMemo(() => {
    if (filter === 'matched' && latestEntry) return matchEchoes(latestEntry, 6);
    if (filter === 'low') return echoCards.filter(e => e.tags.expressionValence === 'low');
    if (filter === 'recovery') return echoCards.filter(e => e.tags.expressionValence !== 'low');
    return echoCards;
  }, [filter, latestEntry]);

  const hasRecovered = useMemo(() => {
    if (entries.length < 6) return false;
    const recent = entries.slice(-3);
    const prior = entries.slice(-6, -3);
    const avg = (arr) => arr.reduce((s, e) => { const { r, g, b } = hexToRgb(e.colour || '#555'); return s + (r + g + b) / 3; }, 0) / 3;
    return avg(recent) > avg(prior) + 30;
  }, [entries]);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'matched', label: 'For you' },
    { key: 'low', label: 'Tough moments' },
    { key: 'recovery', label: 'Recovery' },
  ];

  return (
    <div className="pb-24 px-5 pt-6 min-h-dvh max-w-lg mx-auto page-enter">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 600, color: '#F0EDE6', letterSpacing: '-0.02em', margin: '0 0 4px' }}>Echoes</h1>
        <p style={{ fontSize: '13px', color: '#6B6777', margin: 0 }}>You're not alone in this</p>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }} className="hide-scrollbar">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
              whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.3s', border: 'none',
              background: filter === key
                ? 'linear-gradient(135deg, rgba(245,166,35,0.2), rgba(255,107,138,0.15))'
                : 'rgba(255,255,255,0.03)',
              color: filter === key ? '#F5A623' : '#6B6777',
              boxShadow: filter === key ? '0 0 0 1px rgba(245,166,35,0.2)' : '0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Recovery prompt */}
      {hasRecovered && !contributed && !showContribute && (
        <div className="glass" style={{
          borderRadius: '20px', padding: '20px', marginBottom: '20px',
          border: '1px solid rgba(245,166,35,0.15)',
          boxShadow: '0 0 30px rgba(245,166,35,0.05), 0 0 0 1px rgba(245,166,35,0.1)',
          animation: 'fadeInUp 0.5s ease-out both',
        }}>
          <p style={{ fontSize: '14px', color: '#F0EDE6', marginBottom: '12px', lineHeight: 1.6 }}>
            You've been feeling lighter recently after a tough stretch. Want to leave an Echo for someone going through something similar?
          </p>
          <button onClick={() => setShowContribute(true)} style={{ fontSize: '13px', color: '#F5A623', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Leave an Echo →
          </button>
        </div>
      )}

      {/* Contribution form */}
      {showContribute && !contributed && (
        <div className="glass" style={{ borderRadius: '20px', padding: '20px', marginBottom: '20px', animation: 'fadeInUp 0.5s ease-out both' }}>
          <p style={{ fontSize: '13px', color: '#9B97A0', marginBottom: '12px' }}>What helped you?</p>
          <textarea
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            placeholder="Something small that made a difference..."
            rows={3}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '12px', color: '#F0EDE6', fontSize: '13px',
              outline: 'none', resize: 'none', marginBottom: '12px', boxSizing: 'border-box',
            }}
          />
          <button
            onClick={() => { setContributed(true); setShowContribute(false); }}
            disabled={!contribution.trim()}
            style={{
              width: '100%', padding: '10px', borderRadius: '14px', border: 'none', cursor: 'pointer',
              background: 'rgba(245,166,35,0.15)', color: '#F5A623', fontSize: '13px', fontWeight: 600,
              opacity: contribution.trim() ? 1 : 0.3,
            }}
          >
            Share anonymously
          </button>
        </div>
      )}

      {contributed && (
        <div className="glass" style={{ borderRadius: '20px', padding: '20px', marginBottom: '20px', textAlign: 'center', animation: 'bloom 0.6s ease-out both' }}>
          <p style={{ fontSize: '14px', color: '#F5A623', margin: '0 0 4px' }}>Echo shared</p>
          <p style={{ fontSize: '12px', color: '#6B6777', margin: 0 }}>Someone who needs it will find it</p>
        </div>
      )}

      {/* Echo Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {displayedEchoes.map((echo, i) => (
          <EchoCard key={echo.id} echo={echo} delay={i * 80} />
        ))}
      </div>
    </div>
  );
}

function EchoCard({ echo, delay }) {
  return (
    <div className="glass" style={{
      borderRadius: '20px', padding: '18px', borderLeft: `3px solid ${echo.colour}`,
      background: `linear-gradient(135deg, ${echo.colour}06 0%, rgba(255,255,255,0.02) 100%)`,
      animation: `fadeInUp 0.5s ease-out ${delay}ms both`,
    }}>
      <p style={{ fontSize: '14px', color: '#F0EDE6', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', marginBottom: '12px', lineHeight: 1.5, opacity: 0.9 }}>
        "{echo.feeling}"
      </p>
      <p style={{ fontSize: '13px', color: '#9B97A0', marginBottom: '10px', lineHeight: 1.5 }}>
        {echo.copingAction}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B6777" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        <span style={{ fontSize: '11px', color: '#6B6777' }}>{echo.timeToRecovery}</span>
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.substr(0, 2), 16), g: parseInt(h.substr(2, 2), 16), b: parseInt(h.substr(4, 2), 16) };
}
