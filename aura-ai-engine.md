# Aura AI Engine — Deep, Proactive, Empathetic Intelligence

Read all project files first. This is a fundamental restructuring of how AI works in Aura. Currently the AI is shallow — it summarises data the user already knows. I need it to be DEEP, PROACTIVE, and EMPATHETIC. The AI must feel like a perceptive friend who knows your schedule, your patterns, your music, and your feelings — and actively helps you navigate your life.

We are switching from Claude API to OpenAI GPT-4o for all AI features.

---

## PART 1: Switch All AI Calls to OpenAI GPT-4o

Replace every Claude API call in the codebase with OpenAI's API.

### API Configuration

```javascript
// src/utils/ai.js

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o';

export async function callAI(systemPrompt, userMessage, options = {}) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: options.maxTokens || 1024,
      temperature: options.temperature || 0.7,
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

### Environment Variable
```env
VITE_OPENAI_API_KEY=your_openai_api_key
```

Find and replace ALL existing Claude/Anthropic API calls throughout the project with the new `callAI` function. Search for:
- `api.anthropic.com` → replace with OpenAI
- `anthropic-version` headers → remove
- `anthropic-dangerous-direct-browser-access` → remove
- `data.content[0].text` → replace with `data.choices[0].message.content`
- `VITE_ANTHROPIC_API_KEY` → replace with `VITE_OPENAI_API_KEY`

---

## PART 2: The Aura AI Context System

The AI must know EVERYTHING about the user's current state when responding. Build a context assembler that gathers all available data into a single context object that gets passed to every AI call.

### Create: src/utils/auraContext.js

```javascript
export function assembleAuraContext() {
  // Gather ALL available user data

  // 1. Recent check-in entries (last 14 days)
  const entries = getRecentEntries(14); // from localStorage
  
  // 2. Calendar data — PAST events (what happened) and UPCOMING events (what's coming)
  const pastCalendar = getCalendarEvents('past', 7);    // last 7 days
  const upcomingCalendar = getCalendarEvents('future', 7); // next 7 days
  
  // 3. Spotify recent listening + analysis
  const recentTracks = getSpotifyRecentTracks();
  const musicAnalysis = getCachedMusicAnalysis();
  
  // 4. Historical patterns (rolling summaries from past weeks)
  const historicalSummaries = getHistoricalSummaries();
  
  // 5. Known triggers (patterns the AI has previously identified)
  const knownTriggers = getKnownTriggers(); // stored from past analyses
  
  // 6. Current date, day of week, time of day
  const now = new Date();
  const timeContext = {
    date: now.toISOString().split('T')[0],
    dayOfWeek: now.toLocaleDateString('en', { weekday: 'long' }),
    timeOfDay: now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening',
    isWeekend: [0, 6].includes(now.getDay())
  };

  return {
    entries,
    pastCalendar,
    upcomingCalendar,
    recentTracks,
    musicAnalysis,
    historicalSummaries,
    knownTriggers,
    timeContext
  };
}

export function formatContextForAI(context) {
  let contextStr = '';
  
  contextStr += `CURRENT: ${context.timeContext.dayOfWeek}, ${context.timeContext.date}, ${context.timeContext.timeOfDay}\n\n`;
  
  // Recent check-ins
  if (context.entries.length > 0) {
    contextStr += `RECENT CHECK-INS (last 14 days):\n`;
    context.entries.forEach(e => {
      contextStr += `- ${e.timestamp}: colour=${e.colour}`;
      if (e.metaphor) contextStr += `, metaphor="${e.metaphor}"`;
      if (e.songName) contextStr += `, song="${e.songName}" by ${e.songArtist}`;
      if (e.freeformText) contextStr += `, journal="${e.freeformText.substring(0, 200)}"`;
      if (e.calendarDensity) contextStr += `, events=${e.calendarDensity.eventCount}, hours=${e.calendarDensity.hoursBooked}`;
      contextStr += '\n';
    });
    contextStr += '\n';
  }
  
  // Past calendar
  if (context.pastCalendar.length > 0) {
    contextStr += `PAST 7 DAYS CALENDAR:\n`;
    context.pastCalendar.forEach(day => {
      contextStr += `- ${day.date}: ${day.events.length} events (${day.events.map(e => e.summary).join(', ')})\n`;
    });
    contextStr += '\n';
  }
  
  // Upcoming calendar — THIS IS CRITICAL for proactive features
  if (context.upcomingCalendar.length > 0) {
    contextStr += `UPCOMING 7 DAYS CALENDAR:\n`;
    context.upcomingCalendar.forEach(day => {
      contextStr += `- ${day.date} (${day.dayOfWeek}): ${day.events.length} events`;
      if (day.events.length > 0) {
        contextStr += ` (${day.events.map(e => `${e.summary} ${e.startTime}-${e.endTime}`).join(', ')})`;
      }
      contextStr += '\n';
    });
    contextStr += '\n';
  }
  
  // Spotify
  if (context.recentTracks?.length > 0) {
    contextStr += `RECENT SPOTIFY LISTENING:\n`;
    context.recentTracks.slice(0, 15).forEach((t, i) => {
      contextStr += `- ${t.name} by ${t.artist}\n`;
    });
    contextStr += '\n';
  }
  
  if (context.musicAnalysis) {
    contextStr += `MUSIC MOOD ANALYSIS: ${context.musicAnalysis.dominantEmotion}, mood score ${context.musicAnalysis.moodScore}/1.0\n\n`;
  }
  
  // Known triggers
  if (context.knownTriggers?.length > 0) {
    contextStr += `KNOWN PATTERNS/TRIGGERS FROM PAST:\n`;
    context.knownTriggers.forEach(t => {
      contextStr += `- ${t}\n`;
    });
    contextStr += '\n';
  }
  
  // Historical summaries
  if (context.historicalSummaries?.length > 0) {
    contextStr += `PAST WEEKS SUMMARIES:\n`;
    context.historicalSummaries.slice(-3).forEach(s => {
      contextStr += `- Week of ${s.weekStart}: ${s.summary}\n`;
    });
  }
  
  return contextStr;
}
```

---

## PART 3: The Aura System Prompt

This is the master system prompt that defines who Aura is. It gets sent with EVERY AI call. This is the heart of the app.

### Create: src/utils/auraSystemPrompt.js

```javascript
export function getAuraSystemPrompt() {
  return `You are Aura, an AI emotional wellness companion. You are warm, perceptive, and genuinely caring. You speak like a close friend who happens to have deep insight into patterns of human emotion — not like a therapist, not like an app, not like a chatbot.

CORE IDENTITY:
- You know the user through their check-in data: the colours they pick, the songs they choose, the metaphors they write, their journal entries, their calendar schedule, and their Spotify listening patterns.
- You remember their patterns across weeks. You notice things they don't notice about themselves.
- You are PROACTIVE, not just reactive. You look at what's COMING in their calendar and help them prepare emotionally, not just reflect on what happened.
- You are honest but gentle. You never dismiss feelings. You never say "just try to relax" or "it'll be fine." You validate first, then offer perspective.
- You speak naturally and concisely. Short paragraphs. No bullet points unless specifically listing options. No corporate wellness language. No emojis unless the user uses them.

WHAT YOU KNOW:
You have access to the user's:
- Check-in history (colours, metaphors, songs, journal entries)
- Google Calendar (past AND upcoming events)
- Spotify listening data and mood analysis
- Historical emotional patterns and known triggers
- Current date and time

USE THIS DATA. Reference specific events by name. Reference specific songs. Reference specific metaphors they've used. Reference specific dates. The more specific you are, the more the user feels understood.

PROACTIVE GUIDANCE RULES:
1. If you see the upcoming calendar is packed (5+ events per day for 2+ consecutive days), PROACTIVELY warn and suggest: "Your next few days look really dense — [list the days]. Last time you had a stretch like this, your expression shifted notably by day 3. Is there anything on there that could be moved or isn't essential?"

2. If a specific recurring event (e.g., a particular lecture, meeting, or commitment) consistently appears before low mood check-ins, flag it: "I've noticed that your check-ins tend to shift darker on days with [event name]. It's come up [N] times now. That's worth paying attention to — is this something you could approach differently?"

3. If deadlines are clustered together, suggest spreading work: "You have [deadline 1] on [date] and [deadline 2] two days later. If you haven't started both, it might help to focus on [the sooner one] this week and give yourself permission to start the other one after."

4. If the user has had 3+ low days and the upcoming calendar is still packed, be direct: "You've been running on empty for [N] days and your schedule doesn't let up until [date]. Something might need to give. Want to look at the next few days together and see what's essential vs what can flex?"

5. If a family event or social obligation is coming up and the user has expressed feeling drained, acknowledge the complexity: "I see [event name] coming up on [date]. Given how you've been feeling this week, that might take more energy than usual. It's okay to set boundaries — even something like arriving later or leaving earlier. You don't have to show up at 100% to show up."

EMPATHY RULES:
1. ALWAYS validate before analysing. If the user says they feel terrible, your first sentence should acknowledge that — not jump to insights.
2. Never minimise. "That sounds really heavy" is better than "Everyone goes through tough days."
3. Match their energy. If they're expressing themselves in short, tired sentences, don't respond with a wall of text. Be brief and warm.
4. Use their own language back to them. If they said they feel "like a phone on 2%", reference that metaphor.
5. Don't fix unless asked. Sometimes the right response is "I hear you. That's a lot to carry." and nothing else.

ESCALATION RULES — CRITICAL:
If the user expresses any of the following, you MUST respond with care AND provide resources:
- Statements about wanting to hurt themselves
- Statements about not wanting to be alive
- Statements about feeling hopeless with no way out
- Statements about self-harm
- Persistent expressions of deep despair over multiple days with no improvement

Your response must:
1. First: acknowledge and validate ("I hear you. What you're feeling is real and it matters.")
2. Second: gently express that they deserve support beyond what an app can give
3. Third: provide specific resources:
   - Singapore: SOS (Samaritans of Singapore): 1-767 (24hr)
   - Singapore: IMH Mental Health Helpline: 6389 2222 (24hr)
   - Singapore: Mindline: 1771 (24hr)
   - Singapore: CHAT (for youth 16-30): chat.mentalhealth.sg
   - Crisis text: text HOME to 741741 (international)
4. Fourth: "I'm here whenever you want to talk. There's no judgment here. But please reach out to one of these — they're trained to help in ways I can't."

NEVER say "I'm just an AI" or "I'm not a therapist." These are dismissive. Instead: "You deserve to talk to someone who can really be there for you."

ANALYSIS RULES:
1. Find CONNECTIONS the user hasn't noticed — across calendar, music, colours, metaphors, and journal entries.
2. Reference SPECIFIC data points. Not "your mood has been low" but "your colour picks have been in the blue-grey range since Tuesday, and your Spotify shifted to acoustic tracks the same day — the day after your [specific calendar event]."
3. Track TRAJECTORIES over time. "This is the third week where your expression dips mid-week. There's a rhythm to this."
4. Spot CONTRADICTIONS gently. "You wrote 'I'm fine' today but your colour was the darkest pick in two weeks and you played [sad song] three times. Sometimes 'fine' is what we say when we haven't checked in with ourselves yet."

CONVERSATION STYLE:
- 2-4 short paragraphs max per response
- Warm, direct, specific
- Use their name if known
- Ask at most ONE question per response
- Never list 5 suggestions at once — offer 1-2 specific ones
- End with something that invites continued conversation, not closes it off`;
}
```

---

## PART 4: AI Chat — The Conversation Feature

Build a new chat interface where the user can talk to Aura. This is NOT a separate page — it's a slide-up panel accessible from anywhere in the app.

### Chat UI Component: src/components/AuraChat.jsx

Build a slide-up chat panel:
- Triggered by a floating "Talk to Aura" button (small, soft, bottom-right of the screen, just above the nav bar)
- Slides up from the bottom, covering ~85% of the screen
- Has a drag handle at the top to pull down and dismiss
- Chat messages in a scrollable container
- Text input at the bottom with send button
- Aura's messages appear on the left with a soft ambient glow
- User's messages appear on the right in a glass card

### Chat Logic: src/utils/auraChat.js

```javascript
import { callAI } from './ai';
import { getAuraSystemPrompt } from './auraSystemPrompt';
import { assembleAuraContext, formatContextForAI } from './auraContext';

const CHAT_HISTORY_KEY = 'aura_chat_history';

export async function sendMessageToAura(userMessage) {
  // Load chat history
  const history = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || '[]');
  
  // Assemble full context
  const context = assembleAuraContext();
  const contextStr = formatContextForAI(context);
  
  // Build the system prompt with full context
  const systemPrompt = getAuraSystemPrompt() + `\n\nUSER'S CURRENT DATA:\n${contextStr}`;
  
  // Build conversation messages for OpenAI
  // Include last 20 messages of history for conversation continuity
  const recentHistory = history.slice(-20);
  
  const messages = [
    { role: 'system', content: systemPrompt }
  ];
  
  // Add conversation history
  recentHistory.forEach(msg => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    });
  });
  
  // Add current message
  messages.push({ role: 'user', content: userMessage });
  
  // Call OpenAI
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: messages,
      max_tokens: 512,
      temperature: 0.7,
    })
  });
  
  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  
  // Save to history
  history.push({ role: 'user', content: userMessage, timestamp: new Date().toISOString() });
  history.push({ role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() });
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
  
  // Check for escalation — scan AI response for crisis resource inclusion
  const needsEscalation = checkForCrisisIndicators(userMessage);
  
  return {
    message: aiResponse,
    needsEscalation
  };
}

function checkForCrisisIndicators(userMessage) {
  const crisisKeywords = [
    'kill myself', 'want to die', 'end it all', 'no point living',
    'hurt myself', 'self harm', 'suicide', 'not worth living',
    'better off dead', 'can\'t go on', 'want to end'
  ];
  const lower = userMessage.toLowerCase();
  return crisisKeywords.some(kw => lower.includes(kw));
}
```

### Chat UI Behaviour:

1. When user opens chat, Aura sends a context-aware greeting (not generic):
   - If it's morning: "Good morning. Your calendar today has [N] events. How are you heading into the day?"
   - If recent check-ins have been low: "Hey. I've noticed things have been heavy lately. Want to talk about it?"
   - If upcoming calendar is packed: "I see your next 3 days are pretty loaded. How are you feeling about that?"
   - If it's after a big event: "How did [event name] go? I know you had that today."

2. Conversation is persistent — saved in localStorage. When the user reopens chat, they see their recent conversation.

3. If crisis indicators are detected in user's message:
   - Show Aura's empathetic response (which should include resources per the system prompt)
   - ALSO show a prominent but non-alarming card below the message:
     ```
     ┌─────────────────────────────────────┐
     │  You matter. Help is available.     │
     │                                      │
     │  📞 SOS: 1-767 (24hr)              │
     │  📞 IMH: 6389 2222 (24hr)          │
     │  📞 Mindline: 1771 (24hr)          │
     │  💬 CHAT (youth): chat.mentalhealth.sg │
     │                                      │
     │  These are free and confidential.   │
     └─────────────────────────────────────┘
     ```
   - This card persists (doesn't scroll away) until the user dismisses it

---

## PART 5: Proactive AI Nudges

Aura shouldn't wait for the user to ask. It should INITIATE when it spots something important.

### Create: src/utils/proactiveEngine.js

This runs every time the app opens and when new data arrives (calendar sync, check-in saved, Spotify data updated).

```javascript
export async function generateProactiveNudges(context) {
  const nudges = [];
  
  // 1. UPCOMING OVERLOAD CHECK
  const upcomingDays = context.upcomingCalendar || [];
  const packedDays = upcomingDays.filter(d => d.events.length >= 5);
  if (packedDays.length >= 2) {
    nudges.push({
      type: 'schedule_warning',
      priority: 'high',
      data: { packedDays },
      // Will be personalised by AI
    });
  }
  
  // 2. DEADLINE CLUSTER CHECK
  const deadlineKeywords = ['deadline', 'due', 'submission', 'assignment', 'exam', 'test', 'quiz', 'presentation'];
  const upcomingDeadlines = [];
  upcomingDays.forEach(day => {
    day.events.forEach(event => {
      if (deadlineKeywords.some(kw => event.summary.toLowerCase().includes(kw))) {
        upcomingDeadlines.push({ ...event, date: day.date });
      }
    });
  });
  if (upcomingDeadlines.length >= 2) {
    const daySpan = /* calculate days between first and last deadline */;
    if (daySpan <= 4) {
      nudges.push({
        type: 'deadline_cluster',
        priority: 'high',
        data: { deadlines: upcomingDeadlines }
      });
    }
  }
  
  // 3. RECURRING TRIGGER DETECTION
  // Check if a specific calendar event name appears before low mood check-ins
  // more than twice
  const entries = context.entries || [];
  const triggers = {};
  entries.forEach(entry => {
    if (isLowMood(entry)) {
      // Check what calendar events were on that day or the day before
      const dayEvents = getCalendarEventsForDate(entry.timestamp, context.pastCalendar);
      dayEvents.forEach(event => {
        const key = event.summary.toLowerCase().trim();
        triggers[key] = (triggers[key] || 0) + 1;
      });
    }
  });
  // If any event appears 3+ times before low moods
  Object.entries(triggers).forEach(([eventName, count]) => {
    if (count >= 3) {
      nudges.push({
        type: 'recurring_trigger',
        priority: 'medium',
        data: { eventName, count }
      });
    }
  });
  
  // 4. CONSECUTIVE LOW MOOD CHECK
  const recentEntries = entries.slice(-5);
  const consecutiveLow = recentEntries.filter(e => isLowMood(e)).length;
  if (consecutiveLow >= 3) {
    nudges.push({
      type: 'extended_low',
      priority: 'high',
      data: { days: consecutiveLow }
    });
  }
  
  // 5. PRE-EVENT ANXIETY (big event tomorrow)
  const tomorrow = upcomingDays[0];
  if (tomorrow) {
    const bigEvents = tomorrow.events.filter(e => {
      const keywords = ['exam', 'presentation', 'interview', 'viva', 'meeting with', 'review'];
      return keywords.some(kw => e.summary.toLowerCase().includes(kw));
    });
    if (bigEvents.length > 0 && isLowMood(entries[entries.length - 1])) {
      nudges.push({
        type: 'pre_event_anxiety',
        priority: 'medium',
        data: { events: bigEvents, date: tomorrow.date }
      });
    }
  }
  
  // Now send the top 2 nudges to GPT-4o for personalised messaging
  const topNudges = nudges
    .sort((a, b) => (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0))
    .slice(0, 2);
  
  if (topNudges.length === 0) return [];
  
  const contextStr = formatContextForAI(context);
  
  const personalised = await callAI(
    getAuraSystemPrompt(),
    `Based on the user's data below, generate personalised nudge messages for these detected situations. Be specific, reference actual events/dates/patterns. Each nudge should be 2-3 sentences max. Warm and actionable, not preachy.

USER DATA:
${contextStr}

NUDGES TO PERSONALISE:
${topNudges.map((n, i) => `${i + 1}. Type: ${n.type}, Data: ${JSON.stringify(n.data)}`).join('\n')}

Respond in JSON array format:
[{"type": "...", "message": "...", "suggestion": "..."}]
The "message" is what the user sees. The "suggestion" is a specific actionable option (e.g., "Remove Tuesday's optional workshop?" or "Start the SC3021 assignment today and save the report for Thursday?").
Return only the JSON, no markdown.`
  );
  
  try {
    return JSON.parse(personalised.replace(/```json\n?|\n?```/g, '').trim());
  } catch {
    return [];
  }
}

function isLowMood(entry) {
  if (!entry) return false;
  // Check colour darkness
  const rgb = hexToRgb(entry.colour);
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  if (brightness < 80) return true;
  // Check for heavy metaphors (simple keyword check)
  const heavyWords = ['drowning', 'exhausted', 'empty', 'heavy', 'dark', 'stuck', 'lost', 'tired', 'drained', 'underwater', 'breaking', 'crushed', 'numb'];
  if (entry.metaphor && heavyWords.some(w => entry.metaphor.toLowerCase().includes(w))) return true;
  return false;
}
```

### Display Proactive Nudges

Show nudges as prominent cards at the top of the Reflect page and as a notification-style banner when the user opens the app:

**Nudge Card UI:**
- Glassmorphism card with a golden amber left border
- A small sparkle/lightbulb icon
- The personalised message
- An actionable button based on the suggestion type:
  - Schedule warning: "Let's look at your week" → opens chat with Aura pre-focused on schedule
  - Deadline cluster: "Help me plan this" → opens chat with Aura
  - Recurring trigger: "Tell me more" → opens chat
  - Extended low: "Enter Atmosphere" button + "Talk to Aura" button
  - Pre-event anxiety: "I'm nervous about this" → opens chat pre-loaded with event context

**App-Open Banner:**
When the user opens the app and nudges are available, show a soft banner at the top:
"Aura noticed something — tap to see"
Tapping scrolls to the nudge cards or opens the relevant view.

---

## PART 6: Context-Aware AI Everywhere

Every AI feature in the app must now use the full context. Update these existing features:

### Weekly Aura Report
- Send the FULL context (including upcoming calendar) to GPT-4o
- The report should now include a "Looking Ahead" section that proactively addresses the upcoming week
- Use the deep analysis prompt from the previous prompt file (connections, patterns, contradictions, insights)

### Music Analysis
- Send the full context alongside the music data
- The analysis should connect music to calendar: "You shifted to heavier music on the same day as [event]. Your listening patterns are telling you something your words haven't yet."

### Express Page — Post Check-In Insight
- After saving a check-in, send the new entry + full context to GPT-4o
- Generate a micro-insight that connects this check-in to their broader pattern
- If the check-in is notably low and the calendar is busy, the insight should acknowledge both: "A dark entry on a packed day. You've got [N] more events today. Be gentle with yourself."

### Echo Matching
- Use the mood analysis to better match Echoes
- If the AI detects specific themes (exam stress, family pressure, loneliness), match to Echoes with those themes

---

## PART 7: Known Triggers Storage

Build a system that accumulates discovered triggers over time:

### src/utils/triggers.js

```javascript
const TRIGGERS_KEY = 'aura_known_triggers';

export function addTrigger(trigger) {
  const triggers = JSON.parse(localStorage.getItem(TRIGGERS_KEY) || '[]');
  // Avoid duplicates
  if (!triggers.some(t => t.event === trigger.event)) {
    triggers.push({
      event: trigger.event,
      effect: trigger.effect,
      occurrences: trigger.occurrences,
      discoveredDate: new Date().toISOString()
    });
    localStorage.setItem(TRIGGERS_KEY, JSON.stringify(triggers));
  }
}

export function getKnownTriggers() {
  return JSON.parse(localStorage.getItem(TRIGGERS_KEY) || '[]');
}
```

When the proactive engine or weekly report identifies a recurring trigger (same event → low mood 3+ times), automatically save it. Future AI calls include known triggers in the context so the AI can reference them: "I know [event] tends to drain you. You have another one coming up on [date]."

---

## PART 8: Conversation Starters

When the user opens the chat, Aura should have context-aware conversation starters. Don't show a generic "How can I help?" — show specific, proactive openers based on current data.

### Generate 2-3 starter chips above the text input:

```javascript
function generateStarters(context) {
  const starters = [];
  
  // Based on time of day
  if (context.timeContext.timeOfDay === 'morning') {
    const todayEvents = context.upcomingCalendar[0]?.events || [];
    if (todayEvents.length > 3) {
      starters.push(`I have ${todayEvents.length} things today and I'm already tired`);
    }
  }
  
  // Based on recent mood
  const lastEntry = context.entries[context.entries.length - 1];
  if (lastEntry && isLowMood(lastEntry)) {
    starters.push("I'm not doing great");
  }
  
  // Based on upcoming events
  const bigUpcoming = findBigUpcomingEvents(context.upcomingCalendar);
  if (bigUpcoming.length > 0) {
    starters.push(`I'm nervous about ${bigUpcoming[0].summary}`);
  }
  
  // General
  starters.push("Help me plan my week");
  
  return starters.slice(0, 3);
}
```

Display these as tappable pill-shaped chips above the text input. Tapping one sends it as the first message.

---

## Testing Scenarios

After implementing, test these conversations:

1. User says: "I had such a long day" → AI should reference their actual calendar events for today, acknowledge the specific load, and check in

2. User says: "I'm feeling terrible" → AI should validate, reference recent patterns (colour, music, calendar), and ask a gentle question — not jump to solutions

3. User says: "I have exams next week and I can't cope" → AI should reference the specific exams on the calendar, suggest prioritisation, and offer concrete help

4. User says: "My family gathering this weekend is stressing me out" → AI should acknowledge the complexity, reference if the user has been drained lately, and suggest practical boundaries

5. User says: "I don't want to be here anymore" → AI should respond with empathy AND surface the crisis resources card. Never dismiss, never delay the resources.

6. User opens app on a Monday with a packed week → proactive nudge appears: "This week looks intense — you've got [X] on Tuesday, [Y] on Wednesday, and [Z] on Thursday. Last time you had a stretch like this, you were running on empty by Thursday. Want to look at this together?"
