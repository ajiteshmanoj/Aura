import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getEntries, getStreakInfo } from '../data/store';
import { getMockCalendarDensity } from '../utils/calendar';
import { getColourMood } from '../utils/colour';

export default function Reflect() {
  const entries = useMemo(() => getEntries().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)), []);
  const calendarDensity = useMemo(() => getMockCalendarDensity(), []);
  const streak = getStreakInfo();

  return (
    <div className="pb-6 px-5 pt-6 max-w-lg mx-auto page-enter">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 600, color: '#F0EDE6', letterSpacing: '-0.02em', margin: '0 0 4px' }}>Reflect</h1>
          <p style={{ fontSize: '13px', color: '#6B6777', margin: 0 }}>Your emotional landscape</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '28px', fontFamily: "'Playfair Display', serif", color: '#F5A623', margin: 0, textShadow: '0 0 20px rgba(245,166,35,0.3)' }}>{streak.totalDays}</p>
          <p style={{ fontSize: '10px', color: '#6B6777', margin: 0 }}>days you showed up</p>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <Link to="/report" className="glass" style={{ flex: 1, borderRadius: '14px', padding: '10px', textAlign: 'center', fontSize: '13px', color: '#B8A9FF', textDecoration: 'none', fontWeight: 500 }}>
          Weekly Report
        </Link>
        <Link to="/playlists" className="glass" style={{ flex: 1, borderRadius: '14px', padding: '10px', textAlign: 'center', fontSize: '13px', color: '#F5A623', textDecoration: 'none', fontWeight: 500 }}>
          Playlists
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Colour Ribbon — watercolour gradient */}
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 600, color: '#F0EDE6', marginBottom: '12px' }}>Your colours</h2>
          <div style={{
            height: '40px', borderRadius: '20px', overflow: 'hidden',
            background: entries.length > 0
              ? `linear-gradient(90deg, ${entries.slice(0, 21).map((e, i) => `${e.colour || '#1e2433'} ${(i / Math.max(1, Math.min(20, entries.length - 1))) * 100}%`).join(', ')})`
              : '#1e2433',
            boxShadow: entries.length > 0 ? `0 4px 20px ${entries[0]?.colour || '#000'}30` : 'none',
          }} />
        </div>

        <div className="section-divider" />

        {/* Calendar Heatmap */}
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 600, color: '#F0EDE6', marginBottom: '12px' }}>Schedule density</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} style={{ fontSize: '10px', color: '#6B6777', textAlign: 'center', fontWeight: 600 }}>{d}</div>
            ))}
            {Object.entries(calendarDensity)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, { eventCount, hoursBooked }]) => {
                const intensity = Math.min(1, hoursBooked / 10);
                // Cool purple → warm amber → hot coral
                const h = 270 - intensity * 240; // 270 (purple) → 30 (amber/coral)
                const s = 40 + intensity * 30;
                const l = 15 + intensity * 25;
                return (
                  <div
                    key={date}
                    style={{
                      aspectRatio: '1', borderRadius: '10px',
                      background: intensity > 0.1
                        ? `hsl(${h}, ${s}%, ${l}%)`
                        : 'rgba(255,255,255,0.02)',
                      border: intensity <= 0.1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      boxShadow: intensity > 0.5 ? `inset 0 0 8px rgba(245,166,35,${intensity * 0.3})` : 'none',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                    }}
                    title={`${date}: ${eventCount} events, ${hoursBooked}h`}
                  />
                );
              })}
          </div>
        </div>

        <div className="section-divider" />

        {/* Music Mood Signature */}
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 600, color: '#F0EDE6', marginBottom: '12px' }}>Music mood</h2>
          <div className="glass" style={{ borderRadius: '20px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px' }}>
              {entries.slice(0, 14).reverse().map((entry, i) => {
                const valence = entry.songFeatures?.valence ?? 0.5;
                const energy = entry.songFeatures?.energy ?? 0.5;
                const h = 30 + valence * 120;
                const s = 50 + energy * 30;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '100%', borderRadius: '6px 6px 0 0',
                      height: `${valence * 60 + 12}px`,
                      background: `linear-gradient(to top, hsl(${h},${s}%,30%), hsl(${h},${s}%,45%))`,
                      boxShadow: `0 0 8px hsl(${h},${s}%,40%)30`,
                      transition: 'height 0.5s ease',
                    }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '10px', color: '#6B6777' }}>2 weeks ago</span>
              <span style={{ fontSize: '10px', color: '#6B6777' }}>today</span>
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* Before/After */}
        {(() => {
          const pairs = [];
          const afterEntries = entries.filter(e => e.isAfterEvent);
          for (const after of afterEntries) {
            const before = entries.find(e => e.isBeforeEvent && e.linkedEventName === after.linkedEventName);
            if (before) pairs.push({ before, after, event: after.linkedEventName });
          }
          if (!pairs.length) return null;
          return (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 600, color: '#F0EDE6', marginBottom: '12px' }}>Before & after</h2>
              {pairs.map(({ before, after, event }) => (
                <div key={event} className="glass" style={{ borderRadius: '20px', padding: '16px', marginBottom: '8px' }}>
                  <p style={{ fontSize: '13px', color: '#9B97A0', marginBottom: '12px' }}>{event}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 6px', backgroundColor: before.colour, boxShadow: `0 0 20px ${before.colour}40` }} />
                      <span style={{ fontSize: '10px', color: '#6B6777' }}>Before</span>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B6777" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 6px', backgroundColor: after.colour, boxShadow: `0 0 20px ${after.colour}40` }} />
                      <span style={{ fontSize: '10px', color: '#6B6777' }}>After</span>
                    </div>
                  </div>
                  {before.metaphor && after.metaphor && (
                    <p style={{ marginTop: '12px', fontSize: '12px', color: '#9B97A0', fontStyle: 'italic', textAlign: 'center' }}>
                      "{before.metaphor}" → "{after.metaphor}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          );
        })()}

        {/* Timeline */}
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 600, color: '#F0EDE6', marginBottom: '12px' }}>Timeline</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {entries.map((entry, i) => (
              <TimelineCard key={entry.id} entry={entry} delay={i * 60} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineCard({ entry, delay }) {
  const date = new Date(entry.timestamp);
  const mood = entry.colour ? getColourMood(entry.colour) : 'neutral';

  return (
    <div className="glass" style={{
      borderRadius: '18px', padding: '14px', borderLeft: `3px solid ${entry.colour || '#1e2433'}`,
      animation: `fadeInUp 0.5s ease-out ${delay}ms both`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '12px', flexShrink: 0,
          backgroundColor: entry.colour || '#1e2433',
          boxShadow: entry.colour ? `0 0 16px ${entry.colour}30` : 'none',
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', color: '#6B6777' }}>
              {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', color: '#6B6777' }}>{mood}</span>
          </div>
          {entry.metaphor && (
            <p style={{ fontSize: '14px', color: '#F0EDE6', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', margin: '0 0 4px', opacity: 0.85 }}>"{entry.metaphor}"</p>
          )}
          {entry.freeformText && (
            <p style={{ fontSize: '12px', color: '#9B97A0', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{entry.freeformText}</p>
          )}
          {entry.songName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#6B6777"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02z" /></svg>
              <span style={{ fontSize: '11px', color: '#6B6777' }}>{entry.songName} — {entry.songArtist}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
