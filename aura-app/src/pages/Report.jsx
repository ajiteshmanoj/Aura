import { useState, useMemo } from 'react';
import { getEntries } from '../data/store';
import { getMockCalendarDensity } from '../utils/calendar';
import { blendColours } from '../utils/colour';

const REPORT_PROMPT = `You are Aura, an emotionally intelligent wellness companion. You analyse patterns in a user's emotional expression, music listening, and schedule to help them understand themselves better.

Here is a user's data for the past week:

COLOUR PICKS (hex values by day):
{colour_data}

METAPHORS/ANALOGIES:
{metaphor_data}

FREEFORM JOURNAL ENTRIES:
{journal_data}

SPOTIFY LISTENING (daily averages):
{spotify_data}

CALENDAR DENSITY (events per day, hours booked):
{calendar_data}

Generate a weekly Aura Report with these sections:
1. PATTERN: One key connection you see between their schedule and their emotional expression. Be specific, reference actual data points. 2-3 sentences.
2. MUSIC INSIGHT: What their listening patterns reveal this week. Reference specific shifts in valence/energy. 2-3 sentences.
3. METAPHOR TRAJECTORY: Thematic analysis of how their analogies evolved through the week. 2-3 sentences.
4. REFLECTION: A gentle, non-prescriptive question or observation to sit with. 1-2 sentences.

Rules:
- Never diagnose. Never say "you seem depressed" or "you may have anxiety."
- Never give direct advice like "you should..." or "try to..."
- Be warm, observant, and specific. Reference their actual words and data.
- Write like a perceptive friend, not a therapist or an app.
- Keep the total response under 200 words.`;

export default function Report() {
  const entries = useMemo(() => getEntries().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)), []);
  const calendarDensity = useMemo(() => getMockCalendarDensity(), []);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get last 7 entries for the report
  const weekEntries = entries.slice(-7);
  const weekColours = weekEntries.map(e => e.colour).filter(Boolean);

  const generateReport = async () => {
    setLoading(true);
    setError(null);

    const colourData = weekEntries.map(e =>
      `${new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}: ${e.colour || 'none'}`
    ).join('\n');

    const metaphorData = weekEntries.map(e =>
      e.metaphor ? `${new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}: "${e.metaphor}"` : ''
    ).filter(Boolean).join('\n') || 'No metaphors recorded';

    const journalData = weekEntries.map(e =>
      e.freeformText ? `${new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}: ${e.freeformText}` : ''
    ).filter(Boolean).join('\n') || 'No journal entries';

    const spotifyData = weekEntries.map(e =>
      e.songFeatures
        ? `${new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}: valence=${e.songFeatures.valence.toFixed(2)}, energy=${e.songFeatures.energy.toFixed(2)}, song="${e.songName}"`
        : ''
    ).filter(Boolean).join('\n') || 'No listening data';

    const calendarData = weekEntries.map(e => {
      const day = e.timestamp.split('T')[0];
      const density = calendarDensity[day] || e.calendarDensity || { eventCount: 0, hoursBooked: 0 };
      return `${new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}: ${density.eventCount} events, ${density.hoursBooked}h`;
    }).join('\n');

    const prompt = REPORT_PROMPT
      .replace('{colour_data}', colourData)
      .replace('{metaphor_data}', metaphorData)
      .replace('{journal_data}', journalData)
      .replace('{spotify_data}', spotifyData)
      .replace('{calendar_data}', calendarData);

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Generate a mock report for demo
      setReport(getMockReport(weekEntries));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      setReport(parseReport(text));
    } catch (err) {
      setError('Could not generate report. Using demo insights instead.');
      setReport(getMockReport(weekEntries));
    }

    setLoading(false);
  };

  return (
    <div className="min-h-dvh pb-24 px-5 pt-6 max-w-lg mx-auto page-enter">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-white mb-1">Weekly Aura Report</h1>
        <p className="text-sm text-gray-500">AI-generated insights from your week</p>
      </div>

      {/* Week's colour palette */}
      <div className="flex gap-2 mb-6">
        {weekColours.map((c, i) => (
          <div
            key={i}
            className="flex-1 h-8 rounded-lg transition-all duration-500 hover:h-10"
            style={{ backgroundColor: c, boxShadow: `0 4px 12px ${c}30` }}
          />
        ))}
      </div>

      {/* Song highlights */}
      {weekEntries.some(e => e.songName) && (
        <div className="glass rounded-2xl p-4 mb-6">
          <h3 className="text-sm text-gray-400 mb-2">This week's soundtrack</h3>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {weekEntries.filter(e => e.songName).map((e, i) => (
              <div key={i} className="shrink-0 text-center">
                <div className="w-12 h-12 rounded-lg bg-aura-card mb-1 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500">
                    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
                <p className="text-[10px] text-gray-400 max-w-[60px] truncate">{e.songName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!report ? (
        <button
          onClick={generateReport}
          disabled={loading || weekEntries.length === 0}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-aura-lavender/80 to-aura-lavender text-aura-bg font-semibold shadow-lg shadow-aura-lavender/20 transition-all duration-300 hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-aura-bg/40 border-t-aura-bg rounded-full animate-spin" />
              Generating your report...
            </span>
          ) : weekEntries.length === 0 ? (
            'Need at least a week of entries'
          ) : (
            'Generate my Aura Report'
          )}
        </button>
      ) : (
        <div className="space-y-4 stagger-children">
          {error && (
            <p className="text-xs text-aura-amber/70 text-center">{error}</p>
          )}

          <ReportCard
            title="Pattern"
            emoji="~"
            content={report.pattern}
            accentColor="aura-amber"
          />
          <ReportCard
            title="Music Insight"
            emoji="~"
            content={report.music}
            accentColor="aura-teal"
          />
          <ReportCard
            title="Metaphor Trajectory"
            emoji="~"
            content={report.metaphor}
            accentColor="aura-lavender"
          />
          <ReportCard
            title="Reflection"
            emoji="~"
            content={report.reflection}
            accentColor="aura-coral"
          />

          <button
            onClick={() => { setReport(null); generateReport(); }}
            className="w-full py-3 rounded-xl border border-aura-border/50 text-gray-400 hover:text-white transition-all text-sm"
          >
            Regenerate report
          </button>
        </div>
      )}
    </div>
  );
}

function ReportCard({ title, content, accentColor }) {
  return (
    <div className="glass rounded-2xl p-5 border-l-2" style={{ borderLeftColor: `var(--color-${accentColor})` }}>
      <h3 className="font-serif text-base text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-300 leading-relaxed">{content}</p>
    </div>
  );
}

function parseReport(text) {
  const sections = { pattern: '', music: '', metaphor: '', reflection: '' };
  const lines = text.split('\n');
  let current = null;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('pattern')) { current = 'pattern'; continue; }
    if (lower.includes('music')) { current = 'music'; continue; }
    if (lower.includes('metaphor')) { current = 'metaphor'; continue; }
    if (lower.includes('reflection')) { current = 'reflection'; continue; }
    if (current && line.trim()) {
      sections[current] += (sections[current] ? ' ' : '') + line.trim();
    }
  }

  return sections;
}

function getMockReport(entries) {
  const hasLowStretch = entries.some(e => e.songFeatures?.valence < 0.3);
  const hasRecovery = entries.some(e => e.songFeatures?.valence > 0.6);

  return {
    pattern: hasLowStretch
      ? 'Your colours shifted noticeably cooler on days with 5+ scheduled events. The deep blues and greys of your busiest days contrast sharply with the warm teals and ambers of your lighter ones. Your schedule and your inner palette seem to move in lockstep.'
      : 'There\'s a gentle rhythm to your week — your warmest colours and most open metaphors appeared on days with fewer commitments. When your calendar opened up, so did your expression.',
    music: hasLowStretch
      ? 'Your listening valence dropped from 0.72 to 0.12 over the course of the week, tracking closely with your exam schedule. The shift from upbeat pop to acoustic, minor-key songs was gradual but unmistakable — your playlist became a mirror of your inner state.'
      : 'Your song choices carried a consistent warmth this week, hovering around moderate energy and positive valence. The soundtrack of your week had a steady, grounded quality to it.',
    metaphor: hasRecovery
      ? 'Your analogies tell a vivid story of compression and release. From "running uphill" to "a tunnel with no light" to "a cracked window letting fresh air in" — there\'s a clear arc from pressure to relief. The imagery shifted from closed, heavy spaces to open, light-filled ones.'
      : 'Your metaphors this week had a reflective, observational quality — watching, noticing, processing. There\'s a quiet attentiveness in your words that suggests you\'re making sense of things at your own pace.',
    reflection: hasRecovery
      ? 'You made it through that stretch. The colours are warming up again, and your metaphors are breathing. What did you learn about yourself in the hard part that you want to hold onto?'
      : 'Your steadiest, warmest expression came on the days you gave yourself the most space. What would it look like to build a little more of that breathing room into the weeks ahead?',
  };
}
