// Mock Aerobook content - ready for YouTube API integration
// Structure: category -> array of clips
// Each clip has: id, youtubeId, creator info, timing, engagement stats, metadata

export const aeroBookContent = {
  'star-citizen': [
    {
      id: 'sc-clip-1',
      youtubeId: 'dQw4w9WgXcQ', // Replace with real YouTube IDs
      creatorHandle: '@MoxyJingles',
      creatorAvatar: 'https://via.placeholder.com/40?text=MJ',
      title: 'Unexpected Pirate Encounter',
      category: 'star-citizen',
      startSec: 45,
      endSec: 60,
      likeCount: 3240,
      viewCount: 15800,
      timestamp: '3d ago',
      duration: 15
    },
    {
      id: 'sc-clip-2',
      youtubeId: '9bZkp7q19f0',
      creatorHandle: '@HangarGames',
      creatorAvatar: 'https://via.placeholder.com/40?text=HG',
      title: 'Hull C Loading Operations',
      category: 'star-citizen',
      startSec: 120,
      endSec: 135,
      likeCount: 2156,
      viewCount: 8940,
      timestamp: '5d ago',
      duration: 15
    },
    {
      id: 'sc-clip-3',
      youtubeId: 'jNQXAC9IVRw',
      creatorHandle: '@CrimeStats',
      creatorAvatar: 'https://via.placeholder.com/40?text=CS',
      title: 'Crusader Industries Delivery Run',
      category: 'star-citizen',
      startSec: 30,
      endSec: 45,
      likeCount: 4521,
      viewCount: 22300,
      timestamp: '1d ago',
      duration: 15
    },
    {
      id: 'sc-clip-4',
      youtubeId: 'E4MZZ3MgX5U',
      creatorHandle: '@PilotSandwich',
      creatorAvatar: 'https://via.placeholder.com/40?text=PS',
      title: 'Racing Through Stanton',
      category: 'star-citizen',
      startSec: 90,
      endSec: 105,
      likeCount: 5840,
      viewCount: 31200,
      timestamp: '2h ago',
      duration: 15
    },
    {
      id: 'sc-clip-5',
      youtubeId: 'RvL1l0XC7tU',
      creatorHandle: '@VerseTales',
      creatorAvatar: 'https://via.placeholder.com/40?text=VT',
      title: 'Derelict Ship Exploration',
      category: 'star-citizen',
      startSec: 60,
      endSec: 75,
      likeCount: 3987,
      viewCount: 18900,
      timestamp: '4d ago',
      duration: 15
    }
  ],
  'squadron-42': [
    {
      id: 'sq42-clip-1',
      youtubeId: 'OPf0YbXqDm0',
      creatorHandle: '@NarrativeMaster',
      creatorAvatar: 'https://via.placeholder.com/40?text=NM',
      title: 'Answer The Call - Opening',
      category: 'squadron-42',
      startSec: 15,
      endSec: 30,
      likeCount: 6240,
      viewCount: 41200,
      timestamp: '1w ago',
      duration: 15
    },
    {
      id: 'sq42-clip-2',
      youtubeId: 'sEmYrHhRw-s',
      creatorHandle: '@CommanderLogbook',
      creatorAvatar: 'https://via.placeholder.com/40?text=CL',
      title: 'First Combat Mission Briefing',
      category: 'squadron-42',
      startSec: 75,
      endSec: 90,
      likeCount: 4521,
      viewCount: 28500,
      timestamp: '5d ago',
      duration: 15
    },
    {
      id: 'sq42-clip-3',
      youtubeId: 'sIlNIVXpIQU',
      creatorHandle: '@LoreMaster',
      creatorAvatar: 'https://via.placeholder.com/40?text=LM',
      title: 'Ivanoff Station Gameplay',
      category: 'squadron-42',
      startSec: 120,
      endSec: 135,
      likeCount: 3156,
      viewCount: 16700,
      timestamp: '3d ago',
      duration: 15
    },
    {
      id: 'sq42-clip-4',
      youtubeId: 'kfvbiuQZL_E',
      creatorHandle: '@SquadronStories',
      creatorAvatar: 'https://via.placeholder.com/40?text=SS',
      title: 'Character Interaction Scenes',
      category: 'squadron-42',
      startSec: 45,
      endSec: 60,
      likeCount: 5234,
      viewCount: 33100,
      timestamp: '2d ago',
      duration: 15
    }
  ],
  'community-highlights': [
    {
      id: 'comm-clip-1',
      youtubeId: 'TYzGJPUPgOU',
      creatorHandle: '@CommunityStarlight',
      creatorAvatar: 'https://via.placeholder.com/40?text=CS',
      title: 'Players Build a Fleet',
      category: 'community-highlights',
      startSec: 30,
      endSec: 45,
      likeCount: 7821,
      viewCount: 52300,
      timestamp: '6h ago',
      duration: 15
    },
    {
      id: 'comm-clip-2',
      youtubeId: 'LAy5yZr4DKo',
      creatorHandle: '@GalaxyGathering',
      creatorAvatar: 'https://via.placeholder.com/40?text=GG',
      title: 'Massive Squadron Formation',
      category: 'community-highlights',
      startSec: 90,
      endSec: 105,
      likeCount: 6543,
      viewCount: 38900,
      timestamp: '12h ago',
      duration: 15
    },
    {
      id: 'comm-clip-3',
      youtubeId: 'I3-I4DPHZBE',
      creatorHandle: '@VerseUnited',
      creatorAvatar: 'https://via.placeholder.com/40?text=VU',
      title: 'Players vs Vanduul Event',
      category: 'community-highlights',
      startSec: 60,
      endSec: 75,
      likeCount: 8934,
      viewCount: 61500,
      timestamp: '1d ago',
      duration: 15
    }
  ]
};

// Category metadata for UI
export const aeroBookCategories = [
  {
    id: 'star-citizen',
    label: 'Star Citizen',
    icon: '🚀',
    color: '#00d9ff'
  },
  {
    id: 'squadron-42',
    label: 'Squadron 42',
    icon: '⚔️',
    color: '#ff6b00'
  },
  {
    id: 'community-highlights',
    label: 'Community',
    icon: '👥',
    color: '#00ff88'
  }
];
