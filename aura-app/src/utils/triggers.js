const TRIGGERS_KEY = 'aura_known_triggers';

export function addTrigger(trigger) {
  const triggers = JSON.parse(localStorage.getItem(TRIGGERS_KEY) || '[]');
  if (!triggers.some(t => t.event === trigger.event)) {
    triggers.push({
      event: trigger.event,
      effect: trigger.effect,
      occurrences: trigger.occurrences,
      discoveredDate: new Date().toISOString(),
    });
    localStorage.setItem(TRIGGERS_KEY, JSON.stringify(triggers));
  }
}

export function getKnownTriggers() {
  try {
    return JSON.parse(localStorage.getItem(TRIGGERS_KEY) || '[]');
  } catch {
    return [];
  }
}
