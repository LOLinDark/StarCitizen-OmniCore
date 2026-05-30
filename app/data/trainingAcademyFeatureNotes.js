export const featureTrainingNotes = {
  shields_decoy_launch: {
    summary: 'Decoys (flares) are for seducing missiles already in flight away from your ship signature.',
    whenToUse: 'Use after missile launch warning; pair with evasive vector change.',
    bestPractice: 'Bigger signatures usually need larger bursts. Tap for single, hold for burst, then break direction/speed.',
    tutorialVideos: [
      {
        title: 'Countermeasure overview (community video)',
        url: 'https://www.youtube.com/watch?v=VwxzwAOIn88',
      },
      {
        title: 'Quick decoy usage tip (short)',
        url: 'https://www.youtube.com/shorts/Gh7v2IWx-Bk',
      },
    ],
    devDiscussionVideos: [],
    readingLinks: [
      {
        title: 'Community discussion: decoy/noise behavior',
        url: 'https://www.reddit.com/r/starcitizen/comments/rn3a36/keybinds_counter_measures/',
      },
      {
        title: 'Community discussion: flare resistant missiles',
        url: 'https://www.reddit.com/r/starcitizen/comments/1edfekd/flarechaff_ressistant_missile/',
      },
    ],
  },
  shields_decoy_increase_size: {
    summary: 'Increase how many decoys are dumped per launch.',
    whenToUse: 'Increase when flying larger, hotter ships or under heavy multi-missile pressure.',
    bestPractice: 'Tune burst size before entering a combat area and adjust as threat profile changes.',
    tutorialVideos: [],
    devDiscussionVideos: [],
    readingLinks: [],
  },
  shields_decoy_decrease_size: {
    summary: 'Decrease decoy burst size to conserve countermeasures.',
    whenToUse: 'Use when threat is low, signature is small, or inventory is limited.',
    bestPractice: 'Balance survival and conservation; do not run minimal burst in high lock-density fights.',
    tutorialVideos: [],
    devDiscussionVideos: [],
    readingLinks: [],
  },
  shields_noise_deploy: {
    summary: 'Noise is a radar/sensor disruption cloud used to break or degrade lock quality before missile launch.',
    whenToUse: 'Deploy before hostile lock completes or while disengaging from tracking pressure.',
    bestPractice: 'Treat as temporary ECM bubble. Use with positioning and emissions control; expect your own sensor picture to degrade.',
    tutorialVideos: [],
    devDiscussionVideos: [],
    readingLinks: [
      {
        title: 'starcitizen.tools: Countermeasures reference',
        url: 'https://starcitizen.tools/Countermeasures',
      },
      {
        title: 'Community discussion: no traditional chaff',
        url: 'https://www.reddit.com/r/starcitizen/comments/o4fxzj/countermeasure_question/',
      },
      {
        title: 'Community discussion: what noise/decoys do',
        url: 'https://www.reddit.com/r/starcitizen/comments/1mni0ex/what_do_counter_measures_do/',
      },
    ],
  },
};

export const combatFocusCategories = [
  'flight',
  'shields',
  'weapons',
  'power',
  'radar',
  'view',
  'hailing',
];

export const gameplayAcademyTracks = {
  combat: {
    label: 'Combat Academy',
    categories: ['flight', 'shields', 'weapons', 'power', 'radar', 'view', 'hailing'],
    defaultSearch: '',
  },
  mining: {
    label: 'Mining Academy',
    categories: ['seats', 'flight', 'scanning', 'power', 'hud'],
    defaultSearch: 'mining',
  },
  trading: {
    label: 'Trading Academy',
    categories: ['flight', 'quantum', 'docking', 'hailing', 'hud'],
    defaultSearch: 'cargo',
  },
  exploration: {
    label: 'Exploration Academy',
    categories: ['flight', 'quantum', 'scanning', 'view', 'hud'],
    defaultSearch: 'scan',
  },
  salvage: {
    label: 'Salvage Academy',
    categories: ['seats', 'flight', 'scanning', 'power', 'hud'],
    defaultSearch: 'salvage',
  },
};

export const academyShipBranches = {
  gladius: {
    label: 'Aegis Gladius',
    suggestedSearch: 'weapon shield missile',
  },
  hornet: {
    label: 'Anvil Hornet',
    suggestedSearch: 'weapon power shield',
  },
  scorpius: {
    label: 'RSI Scorpius',
    suggestedSearch: 'turret weapon radar',
  },
  vanguard: {
    label: 'Aegis Vanguard',
    suggestedSearch: 'torpedo shield power',
  },
};
