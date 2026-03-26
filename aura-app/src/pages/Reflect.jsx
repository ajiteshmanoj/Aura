import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getEntries, getStreakInfo } from '../data/store';
import { getMockCalendarDensity } from '../utils/calendar';
import { getColourMood } from '../utils/colour';

export default function Reflect() {
  const entries = useMemo(() => getEntries().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)), []);
  const calendarDensity = useMemo(() => getMockCalendarDensity(), []);
  const streak = getStreakInfo();

  // Detect negative trend for interventions
  const recentLow = useMemo(() => {
    const recent = entries.slice(0, 3);
    if (recent.length < 3) return false;
    return recent.every(e => {
      if (!e.songFeatures) return false;
      return e.songFeatures.valence < 0.35;
    });
  }, [entries]);

  return (
    <div className="min-h-dvh pb-24 px-5 pt-6 max-w-lg mx-auto page-enter">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-white mb-1">Reflect</h1>
          <p className="text-sm text-gray-500">Your emotional landscape</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-serif text-aura-amber">{streak.totalDays}</p>
          <p className="text-[10px] text-gray-500">days you showed up</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-2 mb-6">
        <Link to="/report" className="flex-1 glass rounded-xl py-2.5 text-center text-sm text-gray-400 hover:text-aura-lavender transition-colors">
          Weekly Report
        </Link>
        <Link to="/playlists" className="flex-1 glass rounded-xl py-2.5 text-center text-sm text-gray-400 hover:text-aura-amber transition-colors">
          Playlists
        </Link>
      </div>

      {/* Intervention: gentle nudge when trend is negative */}
      {recentLow && (
        <div className="glass rounded-2xl p-5 mb-6 border border-aura-lavender/10 animate-fade-in">
          <p className="text-sm text-gray-300 mb-2">Things have felt heavy lately. No judgment — just something to notice.</p>
          <p className="text-xs text-gray-500 italic">"The feeling will pass. It always has."</p>
          <div className="flex gap-2 mt-3">
            <Link to="/echoes" className="text-xs text-aura-lavender hover:underline">See who's been there</Link>
            <span className="text-gray-600">|</span>
            <Link to="/express" className="text-xs text-aura-amber hover:underline">Express it</Link>
          </div>
        </div>
      )}

      <div className="space-y-8 stagger-children">
        {/* Colour Ribbon */}
        <div>
          <h2 className="font-serif text-lg text-white mb-3">Your colours</h2>
          <div className="flex gap-1 h-10 rounded-xl overflow-hidden">
            {entries.slice(0, 21).map((entry, i) => (
              <div
                key={entry.id}
                className="flex-1 transition-all duration-500 hover:flex-[2] cursor-pointer group relative"
                style={{ backgroundColor: entry.colour || '#2a2b36' }}
                title={new Date(entry.timestamp).toLocaleDateString()}
              >
                <div className="absolute inset-x-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="glass rounded-lg px-2 py-1 text-[10px] text-gray-300 whitespace-nowrap mx-auto w-fit">
                    {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Heatmap */}
        <div>
          <h2 className="font-serif text-lg text-white mb-3">Schedule density</h2>
          <div className="grid grid-cols-7 gap-1.5">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-[10px] text-gray-500 text-center font-medium">{d}</div>
            ))}
            {Object.entries(calendarDensity)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, { eventCount, hoursBooked }]) => {
                const intensity = Math.min(1, hoursBooked / 10);
                return (
                  <div
                    key={date}
                    className="aspect-square rounded-lg transition-all duration-300 hover:scale-110 cursor-pointer group relative"
                    style={{
                      backgroundColor: `rgba(240, 160, 80, ${0.08 + intensity * 0.5})`,
                    }}
                    title={`${date}: ${eventCount} events, ${hoursBooked}h`}
                  >
                    <div className="absolute inset-x-0 bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="glass rounded-lg px-2 py-1 text-[10px] text-gray-300 whitespace-nowrap mx-auto w-fit">
                        {eventCount} events, {hoursBooked}h
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Music Mood Signature */}
        <div>
          <h2 className="font-serif text-lg text-white mb-3">Music mood</h2>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-end gap-1 h-24">
              {entries.slice(0, 14).reverse().map((entry, i) => {
                const valence = entry.songFeatures?.valence ?? 0.5;
                const energy = entry.songFeatures?.energy ?? 0.5;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80"
                      style={{
                        height: `${valence * 80 + 8}px`,
                        background: `linear-gradient(to top,
                          hsl(${30 + valence * 120}, ${50 + energy * 30}%, ${30 + valence * 25}%),
                          hsl(${30 + valence * 120}, ${50 + energy * 30}%, ${40 + valence * 30}%))`,
                      }}
                    />
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="glass rounded-lg px-2 py-1 text-[10px] text-gray-300 whitespace-nowrap">
                        {entry.songName && `${entry.songName} — `}v:{valence.toFixed(1)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-gray-500">2 weeks ago</span>
              <span className="text-[10px] text-gray-500">today</span>
            </div>
          </div>
        </div>

        {/* Before/After Event Comparisons */}
        {(() => {
          const beforeAfterPairs = [];
          const afterEntries = entries.filter(e => e.isAfterEvent);
          for (const after of afterEntries) {
            const before = entries.find(e => e.isBeforeEvent && e.linkedEventName === after.linkedEventName);
            if (before) beforeAfterPairs.push({ before, after, event: after.linkedEventName });
          }
          if (beforeAfterPairs.length === 0) return null;
          return (
            <div>
              <h2 className="font-serif text-lg text-white mb-3">Before & after</h2>
              <div className="space-y-3">
                {beforeAfterPairs.map(({ before, after, event }) => (
                  <div key={event} className="glass rounded-2xl p-4">
                    <p className="text-sm text-gray-400 mb-3">{event}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 text-center">
                        <div
                          className="w-12 h-12 rounded-full mx-auto mb-1"
                          style={{ backgroundColor: before.colour, boxShadow: `0 0 20px ${before.colour}40` }}
                        />
                        <span className="text-[10px] text-gray-500">Before</span>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                      <div className="flex-1 text-center">
                        <div
                          className="w-12 h-12 rounded-full mx-auto mb-1"
                          style={{ backgroundColor: after.colour, boxShadow: `0 0 20px ${after.colour}40` }}
                        />
                        <span className="text-[10px] text-gray-500">After</span>
                      </div>
                    </div>
                    {before.metaphor && after.metaphor && (
                      <div className="mt-3 text-xs text-gray-500 italic text-center">
                        "{before.metaphor}" → "{after.metaphor}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Timeline */}
        <div>
          <h2 className="font-serif text-lg text-white mb-3">Timeline</h2>
          <div className="space-y-3">
            {entries.map((entry) => (
              <TimelineCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineCard({ entry }) {
  const date = new Date(entry.timestamp);
  const mood = entry.colour ? getColourMood(entry.colour) : 'neutral';

  return (
    <div className="glass rounded-2xl p-4 transition-all duration-300 hover:border-white/10">
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-xl shrink-0 mt-0.5"
          style={{
            backgroundColor: entry.colour || '#2a2b36',
            boxShadow: entry.colour ? `0 0 16px ${entry.colour}30` : 'none',
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500">
              {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-gray-500">{mood}</span>
          </div>
          {entry.metaphor && (
            <p className="text-sm text-white/80 italic mb-1">"{entry.metaphor}"</p>
          )}
          {entry.freeformText && (
            <p className="text-xs text-gray-400 line-clamp-2">{entry.freeformText}</p>
          )}
          {entry.songName && (
            <div className="flex items-center gap-1.5 mt-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02z" />
              </svg>
              <span className="text-[11px] text-gray-500">{entry.songName} — {entry.songArtist}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
