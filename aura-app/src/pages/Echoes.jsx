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

  // Match echoes based on latest entry, or show all
  const displayedEchoes = useMemo(() => {
    if (filter === 'matched' && latestEntry) {
      return matchEchoes(latestEntry, 6);
    }
    if (filter === 'low') return echoCards.filter(e => e.tags.expressionValence === 'low');
    if (filter === 'recovery') return echoCards.filter(e => e.tags.expressionValence !== 'low');
    return echoCards;
  }, [filter, latestEntry]);

  // Check if user has recovered (for contribution prompt)
  const hasRecovered = useMemo(() => {
    if (entries.length < 6) return false;
    const recent = entries.slice(-3);
    const prior = entries.slice(-6, -3);
    const recentAvg = recent.reduce((s, e) => {
      const { r, g, b } = hexToRgb(e.colour || '#555');
      return s + (r + g + b) / 3;
    }, 0) / 3;
    const priorAvg = prior.reduce((s, e) => {
      const { r, g, b } = hexToRgb(e.colour || '#555');
      return s + (r + g + b) / 3;
    }, 0) / 3;
    return recentAvg > priorAvg + 30;
  }, [entries]);

  return (
    <div className="pb-6 px-5 pt-6 max-w-lg mx-auto page-enter">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-white mb-1">Echoes</h1>
        <p className="text-sm text-gray-500">You're not alone in this</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
        {[
          { key: 'all', label: 'All' },
          { key: 'matched', label: 'For you' },
          { key: 'low', label: 'Tough moments' },
          { key: 'recovery', label: 'Recovery' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
              filter === key
                ? 'bg-aura-amber/20 text-aura-amber border border-aura-amber/30'
                : 'glass text-gray-400 hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Recovery prompt */}
      {hasRecovered && !contributed && !showContribute && (
        <div className="glass rounded-2xl p-5 mb-6 border border-aura-amber/10 animate-fade-in">
          <p className="text-sm text-gray-300 mb-3">
            You've been feeling lighter recently after a tough stretch.
            Want to leave an Echo for someone going through something similar?
          </p>
          <button
            onClick={() => setShowContribute(true)}
            className="text-sm text-aura-amber hover:text-aura-amber/80 transition-colors"
          >
            Leave an Echo
          </button>
        </div>
      )}

      {/* Contribution form */}
      {showContribute && !contributed && (
        <div className="glass rounded-2xl p-5 mb-6 animate-fade-in-up">
          <p className="text-sm text-gray-400 mb-3">What helped you?</p>
          <textarea
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            placeholder="Something small that made a difference..."
            rows={3}
            className="w-full bg-aura-card/60 border border-aura-border/50 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-aura-amber/40 transition-all resize-none text-sm mb-3"
          />
          <button
            onClick={() => {
              setContributed(true);
              setShowContribute(false);
            }}
            disabled={!contribution.trim()}
            className="w-full py-2.5 rounded-xl bg-aura-amber/20 text-aura-amber text-sm font-medium transition-all hover:bg-aura-amber/30 disabled:opacity-30"
          >
            Share anonymously
          </button>
        </div>
      )}

      {contributed && (
        <div className="glass rounded-2xl p-5 mb-6 text-center animate-bloom">
          <p className="text-sm text-aura-amber mb-1">Echo shared</p>
          <p className="text-xs text-gray-500">Someone who needs it will find it</p>
        </div>
      )}

      {/* Echo Cards */}
      <div className="space-y-3 stagger-children">
        {displayedEchoes.map((echo) => (
          <EchoCard key={echo.id} echo={echo} />
        ))}
      </div>
    </div>
  );
}

function EchoCard({ echo }) {
  return (
    <div className="glass rounded-2xl p-5 transition-all duration-300 hover:border-white/8">
      <div className="flex items-start gap-3">
        <div
          className="w-3 h-3 rounded-full mt-1.5 shrink-0"
          style={{
            backgroundColor: echo.colour,
            boxShadow: `0 0 12px ${echo.colour}50`,
          }}
        />
        <div className="flex-1">
          <p className="text-sm text-gray-300 italic mb-3">"{echo.feeling}"</p>
          <p className="text-sm text-white/80 mb-2">{echo.copingAction}</p>
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[11px] text-gray-500">{echo.timeToRecovery}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substr(0, 2), 16),
    g: parseInt(h.substr(2, 2), 16),
    b: parseInt(h.substr(4, 2), 16),
  };
}
