import { callAI } from './ai';
import { getAuraSystemPrompt } from './auraSystemPrompt';
import { assembleAuraContext, formatContextForAI } from './auraContext';

const CHAT_HISTORY_KEY = 'aura_chat_history';

export function getChatHistory() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

export async function sendMessageToAura(userMessage) {
  const history = getChatHistory();
  const context = assembleAuraContext();
  const contextStr = formatContextForAI(context);
  const systemPrompt = getAuraSystemPrompt() + `\n\nUSER'S CURRENT DATA:\n${contextStr}`;

  const recentHistory = history.slice(-20);
  const messages = [{ role: 'system', content: systemPrompt }];
  recentHistory.forEach(msg => {
    messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
  });
  messages.push({ role: 'user', content: userMessage });

  const aiResponse = await callAI(null, null, {
    messages,
    maxTokens: 512,
    temperature: 0.7,
    fallback: "I'm here with you. Sometimes it helps to just sit with things for a moment. What's on your mind?",
  });

  history.push({ role: 'user', content: userMessage, timestamp: new Date().toISOString() });
  history.push({ role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() });
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));

  const needsEscalation = checkForCrisisIndicators(userMessage);
  return { message: aiResponse, needsEscalation };
}

export async function generateGreeting(context) {
  const contextStr = formatContextForAI(context);
  return await callAI(
    getAuraSystemPrompt(),
    `Generate a brief, warm, context-aware greeting (1-2 sentences max) for the user based on their current data. Don't be generic — reference something specific from their data. No quotes around it.\n\nUSER DATA:\n${contextStr}`,
    { maxTokens: 100, fallback: "Hey. How are you doing right now?" }
  );
}

export function generateStarters(context) {
  const starters = [];
  const lastEntry = context.entries[context.entries.length - 1];
  const todayEvents = context.upcomingCalendar[0]?.events || [];

  if (context.timeContext.timeOfDay === 'morning' && todayEvents.length > 3) {
    starters.push(`I have ${todayEvents.length} things today and I'm already tired`);
  }

  if (lastEntry && isLowMood(lastEntry)) {
    starters.push("I'm not doing great");
  }

  const bigUpcoming = [];
  const keywords = ['exam', 'presentation', 'interview', 'deadline', 'test', 'review'];
  for (const day of context.upcomingCalendar.slice(0, 3)) {
    for (const event of day.events) {
      if (keywords.some(kw => event.summary.toLowerCase().includes(kw))) {
        bigUpcoming.push(event);
      }
    }
  }
  if (bigUpcoming.length > 0) {
    starters.push(`I'm nervous about ${bigUpcoming[0].summary}`);
  }

  starters.push("Help me plan my week");
  return starters.slice(0, 3);
}

function checkForCrisisIndicators(userMessage) {
  const crisisKeywords = [
    'kill myself', 'want to die', 'end it all', 'no point living',
    'hurt myself', 'self harm', 'suicide', 'not worth living',
    'better off dead', "can't go on", 'want to end',
  ];
  const lower = userMessage.toLowerCase();
  return crisisKeywords.some(kw => lower.includes(kw));
}

function isLowMood(entry) {
  if (!entry?.colour) return false;
  const h = entry.colour.replace('#', '');
  const r = parseInt(h.substr(0, 2), 16);
  const g = parseInt(h.substr(2, 2), 16);
  const b = parseInt(h.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  if (brightness < 80) return true;
  const heavyWords = ['drowning', 'exhausted', 'empty', 'heavy', 'dark', 'stuck', 'lost', 'tired', 'drained', 'underwater', 'breaking', 'crushed', 'numb'];
  if (entry.metaphor && heavyWords.some(w => entry.metaphor.toLowerCase().includes(w))) return true;
  return false;
}
