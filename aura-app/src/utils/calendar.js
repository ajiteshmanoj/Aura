const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const REDIRECT_URI = `${window.location.origin}/callback/google`;
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

export function initiateGoogleAuth() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'token',
    scope: SCOPES,
    include_granted_scopes: 'true',
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function fetchCalendarEvents(token, timeMin, timeMax) {
  if (!token) return [];
  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  });
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  return data.items || [];
}

export function computeDailyDensity(events) {
  const density = {};
  for (const event of events) {
    const start = event.start?.dateTime || event.start?.date;
    if (!start) continue;
    const day = start.split('T')[0];
    if (!density[day]) density[day] = { eventCount: 0, hoursBooked: 0 };
    density[day].eventCount++;
    if (event.start?.dateTime && event.end?.dateTime) {
      const dur = (new Date(event.end.dateTime) - new Date(event.start.dateTime)) / 3600000;
      density[day].hoursBooked += dur;
    }
  }
  return density;
}

// Mock calendar data for demo
export function getMockCalendarDensity() {
  const density = {};
  const now = new Date();
  for (let i = 0; i < 28; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    // Simulate varying busyness — busier in week 2-3 ago
    let eventCount, hoursBooked;
    if (i >= 7 && i <= 14) {
      eventCount = 3 + Math.floor(Math.random() * 4);
      hoursBooked = eventCount * 1.5 + Math.random() * 2;
    } else if (i >= 15) {
      eventCount = 1 + Math.floor(Math.random() * 3);
      hoursBooked = eventCount * 1.2 + Math.random();
    } else {
      eventCount = 1 + Math.floor(Math.random() * 2);
      hoursBooked = eventCount * 1 + Math.random();
    }
    density[key] = { eventCount, hoursBooked: Math.round(hoursBooked * 10) / 10 };
  }
  return density;
}
