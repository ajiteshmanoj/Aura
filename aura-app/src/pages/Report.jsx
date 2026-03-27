import { useState, useMemo } from 'react';
import { getEntries } from '../data/store';
import { getMockCalendarDensity } from '../utils/calendar';

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

  const weekEntries = entries.slice(-7);
  const weekColours = weekEntries.map(e => e.colour).filter(Boolean);

  const generateReport = async () => {
    setLoading(true);
    setError(null);

    const colourData = weekEntries.map(e => `${new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}: ${e.colour || 'none'}`).join('\n');
    const metaphorData = weekEntries.map(e => e.metaphor ? `${new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}: "${e.metaphor}"` : '').filter(Boolean).join('\n') || 'No metaphors recorded';
    const journalData = weekEntries.map(e => e.freeformText ? `${new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}: ${e.freeformText}` : '').filter(Boolean).join('\n') || 'No journal entries';
    const spotifyData = weekEntries.map(e => e.songFeatures ? `${new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}: valence=${e.songFeatures.valence.toFixed(2)}, energy=${e.songFeatures.energy.toFixed(2)}, song="${e.songName}"` : '').filter(Boolean).join('\n') || 'No listening data';
    const calendarData = weekEntries.map(e => { const d = calendarDensity[e.timestamp.split('T')[0]] || e.calendarDensity || { eventCount: 0, hoursBooked: 0 }; return `${new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}: ${d.eventCount} events, ${d.hoursBooked}h`; }).join('\n');

    const prompt = REPORT_PROMPT.replace('{colour_data}', colourData).replace('{metaphor_data}', metaphorData).replace('{journal_data}', journalData).replace('{spotify_data}', spotifyData).replace('{calendar_data}', calendarData);
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    if (!apiKey) { setReport(getMockReport(weekEntries)); setLoading(false); return; }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 400, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      setReport(parseReport(data.content?.[0]?.text || ''));
    } catch {
      setError('Using demo insights.');
      setReport(getMockReport(weekEntries));
    }
    setLoading(false);
  };

  const sections = [
    { key: 'pattern', title: 'Pattern', icon: '〰', color: '#F5A623' },
    { key: 'music', title: 'Music Insight', icon: '♪', color: '#6EECD4' },
    { key: 'metaphor', title: 'Metaphor Trajectory', icon: '"', color: '#B8A9FF' },
    { key: 'reflection', title: 'Reflection', icon: '◯', color: '#FF6B8A' },
  ];

  return (
    <div className="pb-6 px-5 pt-6 max-w-lg mx-auto page-enter">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 600, color: '#F0EDE6', letterSpacing: '-0.02em', margin: '0 0 4px' }}>Weekly Report</h1>
        <p style={{ fontSize: '13px', color: '#6B6777', margin: 0 }}>AI-generated insights from your week</p>
      </div>

      {/* Colour palette — overlapping circles */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        {weekColours.map((c, i) => (
          <div key={i} style={{
            width: '36px', height: '36px', borderRadius: '50%', backgroundColor: c,
            marginLeft: i > 0 ? '-8px' : 0, border: '2px solid #0a0a1a',
            boxShadow: `0 0 16px ${c}40`, position: 'relative', zIndex: weekColours.length - i,
          }} />
        ))}
      </div>

      {/* Song highlights */}
      {weekEntries.some(e => e.songName) && (
        <div className="glass" style={{ borderRadius: '18px', padding: '14px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '13px', color: '#9B97A0', marginBottom: '10px' }}>This week's soundtrack</h3>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }} className="hide-scrollbar">
            {weekEntries.filter(e => e.songName).map((e, i) => (
              <div key={i} style={{ flexShrink: 0, textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6777" strokeWidth="1.5"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                </div>
                <p style={{ fontSize: '10px', color: '#9B97A0', maxWidth: '56px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.songName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!report ? (
        <button
          onClick={generateReport}
          disabled={loading || weekEntries.length === 0}
          style={{
            width: '100%', padding: '16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #B8A9FF, #9B8CE8)', color: '#0a0a1a',
            fontWeight: 700, fontSize: '15px', boxShadow: '0 8px 32px rgba(184,169,255,0.3)',
            opacity: (loading || weekEntries.length === 0) ? 0.4 : 1,
            transition: 'all 0.3s',
          }}
        >
          {loading ? 'Generating your report...' : weekEntries.length === 0 ? 'Need at least a week of entries' : 'Generate my Aura Report'}
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {error && <p style={{ fontSize: '12px', color: '#F5A623', textAlign: 'center', opacity: 0.7 }}>{error}</p>}

          {sections.map(({ key, title, icon, color }, i) => (
            <div key={key} className="glass" style={{
              borderRadius: '20px', padding: '18px', borderLeft: `3px solid ${color}`,
              animation: `fadeInUp 0.5s ease-out ${i * 100}ms both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px', color: color, opacity: 0.6 }}>{icon}</span>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', color: '#F0EDE6', margin: 0 }}>{title}</h3>
              </div>
              <p style={{
                fontSize: '13px', color: '#9B97A0', lineHeight: 1.7, margin: 0,
                fontFamily: key === 'reflection' ? "'Playfair Display', serif" : "'DM Sans', sans-serif",
                fontStyle: key === 'reflection' ? 'italic' : 'normal',
              }}>
                {report[key]}
              </p>
            </div>
          ))}

          <button onClick={() => { setReport(null); generateReport(); }} style={{
            width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)',
            background: 'transparent', color: '#6B6777', fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s',
          }}>
            Regenerate report
          </button>
        </div>
      )}
    </div>
  );
}

function parseReport(text) {
  const sections = { pattern: '', music: '', metaphor: '', reflection: '' };
  let current = null;
  for (const line of text.split('\n')) {
    const lower = line.toLowerCase();
    if (lower.includes('pattern')) { current = 'pattern'; continue; }
    if (lower.includes('music')) { current = 'music'; continue; }
    if (lower.includes('metaphor')) { current = 'metaphor'; continue; }
    if (lower.includes('reflection')) { current = 'reflection'; continue; }
    if (current && line.trim()) sections[current] += (sections[current] ? ' ' : '') + line.trim();
  }
  return sections;
}

function getMockReport(entries) {
  const hasLow = entries.some(e => e.songFeatures?.valence < 0.3);
  const hasRecovery = entries.some(e => e.songFeatures?.valence > 0.6);
  return {
    pattern: hasLow ? 'Your colours shifted noticeably cooler on days with 5+ scheduled events. The deep blues and greys of your busiest days contrast sharply with the warm teals and ambers of your lighter ones.' : 'There\'s a gentle rhythm to your week — your warmest colours appeared on days with fewer commitments.',
    music: hasLow ? 'Your listening valence dropped from 0.72 to 0.12 over the week, tracking closely with your exam schedule. The shift from upbeat pop to acoustic, minor-key songs was gradual but unmistakable.' : 'Your song choices carried a consistent warmth this week, hovering around moderate energy and positive valence.',
    metaphor: hasRecovery ? 'Your analogies tell a vivid story of compression and release. From "running uphill" to "a cracked window letting fresh air in" — there\'s a clear arc from pressure to relief.' : 'Your metaphors had a reflective, observational quality — watching, noticing, processing at your own pace.',
    reflection: hasRecovery ? 'You made it through that stretch. The colours are warming up again. What did you learn about yourself in the hard part that you want to hold onto?' : 'Your steadiest expression came on the days you gave yourself the most space. What would more breathing room look like?',
  };
}
