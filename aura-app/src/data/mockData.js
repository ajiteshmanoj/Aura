// 3-week mock data arc for demo
// Week 1: Calm, moderate busyness
// Week 2: Increasing stress (exam prep)
// Week 3: Peak stress then recovery

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

export const mockEntries = [
  // Week 1 — calm, moderate
  {
    id: 'mock-1', timestamp: daysAgo(20),
    colour: '#5ab5a0', metaphor: 'A boat on calm water',
    freeformText: 'Had a good morning lecture. Coffee with Priya after. Nothing dramatic, just... nice.',
    songName: 'Golden Hour', songArtist: 'JVKE', songAlbumArt: '',
    songFeatures: { valence: 0.72, energy: 0.55, tempo: 112, danceability: 0.65, acousticness: 0.3, mode: 1 },
    calendarDensity: { eventCount: 3, hoursBooked: 4 }
  },
  {
    id: 'mock-2', timestamp: daysAgo(19),
    colour: '#d4a76a', metaphor: 'Warm sunlight through a window',
    freeformText: 'Finished my CS assignment early. Rewarded myself with a walk around campus.',
    songName: 'Sunflower', songArtist: 'Post Malone', songAlbumArt: '',
    songFeatures: { valence: 0.78, energy: 0.52, tempo: 90, danceability: 0.76, acousticness: 0.25, mode: 1 },
    calendarDensity: { eventCount: 2, hoursBooked: 3 }
  },
  {
    id: 'mock-3', timestamp: daysAgo(18),
    colour: '#7eb8a7', metaphor: 'A deep breath between chapters',
    freeformText: 'Rest day. Watched a movie with my roommate. Feel recharged.',
    songName: 'Electric Feel', songArtist: 'MGMT', songAlbumArt: '',
    songFeatures: { valence: 0.68, energy: 0.72, tempo: 120, danceability: 0.82, acousticness: 0.05, mode: 1 },
    calendarDensity: { eventCount: 1, hoursBooked: 1 }
  },
  {
    id: 'mock-4', timestamp: daysAgo(17),
    colour: '#a8c5b8', metaphor: 'A playlist on shuffle — some surprises, mostly good',
    freeformText: 'Tutorial was interesting today. Group project meeting was okay, we\'re on track.',
    songName: 'Levitating', songArtist: 'Dua Lipa', songAlbumArt: '',
    songFeatures: { valence: 0.84, energy: 0.78, tempo: 103, danceability: 0.9, acousticness: 0.02, mode: 1 },
    calendarDensity: { eventCount: 4, hoursBooked: 5 }
  },
  {
    id: 'mock-5', timestamp: daysAgo(16),
    colour: '#e8b87a', metaphor: 'Like a cat in a sunbeam',
    freeformText: 'Friday vibes. Good food, good company. Feeling grateful.',
    songName: 'Blinding Lights', songArtist: 'The Weeknd', songAlbumArt: '',
    songFeatures: { valence: 0.65, energy: 0.8, tempo: 171, danceability: 0.51, acousticness: 0.0, mode: 1 },
    calendarDensity: { eventCount: 2, hoursBooked: 2 }
  },
  {
    id: 'mock-6', timestamp: daysAgo(15),
    colour: '#93c5b1', metaphor: 'A slow Saturday morning',
    freeformText: 'Slept in. Went to the farmers market. Called my parents.',
    songName: 'Here Comes the Sun', songArtist: 'The Beatles', songAlbumArt: '',
    songFeatures: { valence: 0.82, energy: 0.44, tempo: 126, danceability: 0.58, acousticness: 0.59, mode: 1 },
    calendarDensity: { eventCount: 0, hoursBooked: 0 }
  },
  {
    id: 'mock-7', timestamp: daysAgo(14),
    colour: '#b5cda3', metaphor: 'Like stretching after a good nap',
    freeformText: 'Prepped for the week ahead. Feeling organised and calm.',
    songName: 'Sunday Best', songArtist: 'Surfaces', songAlbumArt: '',
    songFeatures: { valence: 0.88, energy: 0.68, tempo: 110, danceability: 0.72, acousticness: 0.18, mode: 1 },
    calendarDensity: { eventCount: 1, hoursBooked: 1 }
  },

  // Week 2 — stress building (exam prep)
  {
    id: 'mock-8', timestamp: daysAgo(13),
    colour: '#7a8fa6', metaphor: 'A backpack getting heavier with each class',
    freeformText: 'Midterms announced. Three exams in one week. Starting to feel the pressure.',
    songName: 'Heather', songArtist: 'Conan Gray', songAlbumArt: '',
    songFeatures: { valence: 0.35, energy: 0.42, tempo: 102, danceability: 0.6, acousticness: 0.55, mode: 0 },
    calendarDensity: { eventCount: 5, hoursBooked: 6 }
  },
  {
    id: 'mock-9', timestamp: daysAgo(12),
    colour: '#607080', metaphor: 'Running uphill with the wind against me',
    freeformText: 'Study group cancelled. Had to cover everything alone. Library until 11pm.',
    songName: 'The Night We Met', songArtist: 'Lord Huron', songAlbumArt: '',
    songFeatures: { valence: 0.22, energy: 0.3, tempo: 108, danceability: 0.35, acousticness: 0.74, mode: 0 },
    calendarDensity: { eventCount: 6, hoursBooked: 8 }
  },
  {
    id: 'mock-10', timestamp: daysAgo(11),
    colour: '#556070', metaphor: 'Like a phone on 2%',
    freeformText: 'Exhausted. Can\'t focus. Everything feels urgent but nothing is getting done.',
    songName: 'Liability', songArtist: 'Lorde', songAlbumArt: '',
    songFeatures: { valence: 0.18, energy: 0.22, tempo: 80, danceability: 0.28, acousticness: 0.88, mode: 0 },
    calendarDensity: { eventCount: 5, hoursBooked: 7 },
    isBeforeEvent: true, linkedEventName: 'CS2040 Midterm'
  },
  {
    id: 'mock-11', timestamp: daysAgo(10),
    colour: '#4a5568', metaphor: 'Drowning in deadlines',
    freeformText: 'First exam tomorrow. I\'ve studied but it doesn\'t feel like enough. Mind is racing.',
    songName: 'Skinny Love', songArtist: 'Bon Iver', songAlbumArt: '',
    songFeatures: { valence: 0.15, energy: 0.2, tempo: 76, danceability: 0.22, acousticness: 0.92, mode: 0 },
    calendarDensity: { eventCount: 4, hoursBooked: 9 }
  },
  {
    id: 'mock-12', timestamp: daysAgo(9),
    colour: '#3d4a5c', metaphor: 'A grey ceiling pressing down',
    freeformText: 'Exam was harder than expected. Two more to go. Barely ate today.',
    songName: 'All I Want', songArtist: 'Kodaline', songAlbumArt: '',
    songFeatures: { valence: 0.12, energy: 0.18, tempo: 72, danceability: 0.2, acousticness: 0.9, mode: 0 },
    calendarDensity: { eventCount: 3, hoursBooked: 10 },
    isAfterEvent: true, linkedEventName: 'CS2040 Midterm'
  },
  {
    id: 'mock-13', timestamp: daysAgo(8),
    colour: '#485566', metaphor: 'Static on a screen — nothing comes through clearly',
    freeformText: 'Can\'t sleep. Brain won\'t turn off. Tomorrow is the stats exam.',
    songName: 'Exile', songArtist: 'Taylor Swift ft. Bon Iver', songAlbumArt: '',
    songFeatures: { valence: 0.14, energy: 0.28, tempo: 86, danceability: 0.32, acousticness: 0.72, mode: 0 },
    calendarDensity: { eventCount: 2, hoursBooked: 11 },
    isBeforeEvent: true, linkedEventName: 'ST2334 Statistics Midterm'
  },

  // Week 3 — peak stress then recovery
  {
    id: 'mock-14', timestamp: daysAgo(7),
    colour: '#394855', metaphor: 'A tunnel with no light yet',
    freeformText: 'Last exam today. I gave it everything. Now I just want to sleep for a year.',
    songName: 'Breathe Me', songArtist: 'Sia', songAlbumArt: '',
    songFeatures: { valence: 0.1, energy: 0.25, tempo: 68, danceability: 0.18, acousticness: 0.85, mode: 0 },
    calendarDensity: { eventCount: 2, hoursBooked: 8 },
    isAfterEvent: true, linkedEventName: 'ST2334 Statistics Midterm'
  },
  {
    id: 'mock-15', timestamp: daysAgo(6),
    colour: '#506070', metaphor: 'The silence after a storm',
    freeformText: 'Exams are done. Slept 12 hours. Still feel drained but the pressure is gone.',
    songName: 'Watermelon Sugar', songArtist: 'Harry Styles', songAlbumArt: '',
    songFeatures: { valence: 0.55, energy: 0.55, tempo: 95, danceability: 0.68, acousticness: 0.12, mode: 1 },
    calendarDensity: { eventCount: 0, hoursBooked: 0 }
  },
  {
    id: 'mock-16', timestamp: daysAgo(5),
    colour: '#6a8a7a', metaphor: 'A cracked window letting fresh air in',
    freeformText: 'Went out for dinner with friends. First time I\'ve laughed in a week.',
    songName: 'Good Days', songArtist: 'SZA', songAlbumArt: '',
    songFeatures: { valence: 0.62, energy: 0.5, tempo: 122, danceability: 0.55, acousticness: 0.3, mode: 1 },
    calendarDensity: { eventCount: 1, hoursBooked: 1 }
  },
  {
    id: 'mock-17', timestamp: daysAgo(4),
    colour: '#80b5a0', metaphor: 'Sunlight through a dirty window — there, even if filtered',
    freeformText: 'Getting back into a routine. Cooked for the first time in two weeks. Small wins.',
    songName: 'Espresso', songArtist: 'Sabrina Carpenter', songAlbumArt: '',
    songFeatures: { valence: 0.72, energy: 0.7, tempo: 104, danceability: 0.8, acousticness: 0.08, mode: 1 },
    calendarDensity: { eventCount: 2, hoursBooked: 3 }
  },
  {
    id: 'mock-18', timestamp: daysAgo(3),
    colour: '#a0c5a8', metaphor: 'Like slowly coming back to colour after a black-and-white film',
    freeformText: 'Worked on a side project. Felt creative for the first time in weeks. Energy is returning.',
    songName: 'As It Was', songArtist: 'Harry Styles', songAlbumArt: '',
    songFeatures: { valence: 0.68, energy: 0.65, tempo: 174, danceability: 0.7, acousticness: 0.34, mode: 1 },
    calendarDensity: { eventCount: 2, hoursBooked: 2 }
  },
  {
    id: 'mock-19', timestamp: daysAgo(2),
    colour: '#c5b880', metaphor: 'Golden hour — everything looks better in this light',
    freeformText: 'Beautiful day. Walked by the lake. Feeling hopeful about the rest of the semester.',
    songName: 'Vienna', songArtist: 'Billy Joel', songAlbumArt: '',
    songFeatures: { valence: 0.75, energy: 0.58, tempo: 81, danceability: 0.62, acousticness: 0.42, mode: 1 },
    calendarDensity: { eventCount: 1, hoursBooked: 1 }
  },
  {
    id: 'mock-20', timestamp: daysAgo(1),
    colour: '#e8c580', metaphor: 'A deep, satisfying exhale',
    freeformText: 'Exam results came back — did better than I thought. All that stress, and I made it through.',
    songName: 'Lovely Day', songArtist: 'Bill Withers', songAlbumArt: '',
    songFeatures: { valence: 0.88, energy: 0.6, tempo: 98, danceability: 0.72, acousticness: 0.38, mode: 1 },
    calendarDensity: { eventCount: 2, hoursBooked: 2 }
  },
];

export const mockSpotifySignatures = mockEntries.map(e => ({
  date: e.timestamp.split('T')[0],
  avgValence: e.songFeatures?.valence ?? 0.5,
  avgEnergy: e.songFeatures?.energy ?? 0.5,
  avgTempo: e.songFeatures?.tempo ?? 100,
  avgDanceability: e.songFeatures?.danceability ?? 0.5,
  avgAcousticness: e.songFeatures?.acousticness ?? 0.3,
  trackCount: Math.floor(Math.random() * 20) + 10,
  uniqueTracks: Math.floor(Math.random() * 15) + 5,
  repeatListens: Math.floor(Math.random() * 8),
  topTracks: [{ name: e.songName, artist: e.songArtist, valence: e.songFeatures?.valence ?? 0.5 }],
}));

export function seedMockData() {
  const existing = localStorage.getItem('aura_entries');
  if (!existing || JSON.parse(existing).length === 0) {
    localStorage.setItem('aura_entries', JSON.stringify(mockEntries));
    return true;
  }
  return false;
}
