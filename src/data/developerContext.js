/**
 * Developer Context System
 * 
 * Maps pages to relevant tasks, documentation, and reminders.
 * Shown in dev mode to help developers stay oriented.
 * 
 * Update this as features evolve and docs change.
 */

export const developerContext = {
  // Main Dashboard
  '/': {
    title: 'Main Dashboard (Post-Login)',
    status: '✅ WIP - Feature Cards Implemented',
    docs: [
      { title: 'Project Overview', path: 'docs/DEVELOPER-REFERENCE.md' },
      { title: 'OmniCore Roadmap', path: 'g:\\My Drive\\Project Management\\Live\\OmniCore-Documentation\\OmniCore-ROADMAP.md' },
    ],
    tasks: [
      '✅ Post-login flow implemented',
      '✅ 6 feature cards created',
      '✅ Header with menu and user info',
      '⏳ Integrate real citizen data from RSI API',
      '⏳ Add organization badges/colors',
      '⏳ Ship database integration',
    ],
    reminder: 'This is the main user-facing dashboard. Keep it immersive and responsive. See MainDashboardPage.jsx',
  },

  // HOTAS Config
  '/hotas-config': {
    title: 'HOTAS Configuration',
    status: '⏳ In Development',
    docs: [
      { title: 'HOTAS Config Guide', path: 'docs/HOTAS-CONFIG-GUIDE.md' },
      { title: 'HOTAS Quick Ref', path: 'g:\\My Drive\\Project Management\\Live\\OmniCore-Documentation\\HOTAS\\STAR-CITIZEN-HOTAS-QUICK-REFERENCE.md' },
      { title: 'Web vs Desktop', path: 'g:\\My Drive\\Project Management\\Live\\OmniCore-Documentation\\HOTAS\\STAR-CITIZEN-HOTAS-WEB-VS-DESKTOP.md' },
    ],
    tasks: [
      '✅ Config page created',
      '⏳ Joystick library integration',
      '⏳ Profile management (save/load)',
      '⏳ Real-time input display',
      '⏳ Mapping presets',
      '⏳ Test with actual hardware',
    ],
    reminder: 'This is a core feature. Refer to HOTAS feasibility & implementation docs. Test with real joysticks.',
  },

  // Developer API Test
  '/developer/api-test': {
    title: 'API Testing Suite',
    status: '✅ Citizen API Working',
    docs: [
      { title: 'API Integration Guide', path: 'docs/API-INTEGRATION.md' },
      { title: 'Star Citizen API Docs', path: 'https://starcitizen-api.com/api.php' },
      { title: 'Security Standards', path: 'docs/SECURITY.md' },
    ],
    tasks: [
      '✅ Star Citizen citizen lookup (live)',
      '✅ Gemini AI chat testing',
      '✅ Rate limits monitoring',
      '⏳ Cache validation UI',
      '⏳ Batch API testing',
      '⏳ Response timing analysis',
    ],
    reminder: 'Star Citizen API endpoint: /{apikey}/v1/live/user/{handle} on api.starcitizen-api.com. Get key from Discord.',
  },

  // Developer Page
  '/developer': {
    title: 'Developer Hub',
    status: '🔧 Maintenance',
    docs: [
      { title: 'Tech Stack & Architecture', path: 'docs/DEVELOPER-REFERENCE.md' },
      { title: 'Security Audit', path: 'docs/SECURITY.md' },
    ],
    tasks: [
      '✅ Dev mode toggle',
      '✅ Activity logging',
      '✅ Error monitoring',
      '⏳ Performance metrics',
      '⏳ Build size analysis',
      '⏳ Bundle budget tracking',
    ],
    reminder: 'This is the nerve center for development. Keep tools organized and discoverable.',
  },

  // Login Page
  '/login': {
    title: 'RSI Login',
    status: '✅ MVP Complete',
    docs: [
      { title: 'Auth Architecture', path: 'docs/DEVELOPER-REFERENCE.md#authentication' },
    ],
    tasks: [
      '✅ Basic login with handle',
      '⏳ Fetch real citizen data',
      '⏳ Display profile info on login',
      '⏳ Error handling for invalid handles',
      '⏳ Welcome/onboarding flow',
    ],
    reminder: 'Plan: Fetch RSI data after login using citizen handle. Show real org/profile.',
  },

  // Settings
  '/settings': {
    title: 'Settings & Configuration',
    status: '⏳ WIP',
    docs: [
      { title: 'Settings Architecture', path: 'docs/DEVELOPER-REFERENCE.md' },
    ],
    tasks: [
      '✅ Theme switcher',
      '⏳ User preferences',
      '⏳ Cost alert thresholds',
      '⏳ API key management',
      '⏳ Export/import config',
    ],
    reminder: 'Keep settings in Zustand store with localStorage persistence.',
  },

  // Aerobook (Media Library)
  '/aerobook': {
    title: 'Aerobook (Media & Social)',
    status: '⏳ In Development',
    docs: [
      { title: 'Aerobook Guide', path: 'docs/AEROBOOK-GUIDE.md' },
    ],
    tasks: [
      '✅ Basic grid layout',
      '⏳ YouTube API integration',
      '⏳ Twitch API integration',
      '⏳ Content filtering',
      '⏳ Like/comment system',
      '⏳ Bookmarking',
    ],
    reminder: 'Goal: Instagram-like experience for Star Citizen content. See AEROBOOK-GUIDE.md for YouTube setup.',
  },

  // Chat (Gemini)
  '/admin/chat/gemini': {
    title: 'Gemini AI Chat',
    status: '✅ Working',
    docs: [
      { title: 'AI Integration', path: 'docs/API-INTEGRATION.md#google-gemini-api' },
    ],
    tasks: [
      '✅ Chat interface',
      '✅ Token counting',
      '✅ Cost tracking',
      '⏳ Conversation history',
      '⏳ System prompt customization',
      '⏳ Star Citizen context injection',
    ],
    reminder: 'Using Gemini 2.0 Flash. Keep token usage visible. Update system prompts in server.',
  },

  // Analytics
  '/admin/analytics': {
    title: 'Analytics & Usage',
    status: '✅ MVP',
    docs: [
      { title: 'Monitoring & Logging', path: 'docs/SECURITY.md#logging--monitoring' },
    ],
    tasks: [
      '✅ Request counting',
      '✅ Cost calculation',
      '✅ Token tracking',
      '⏳ Charts & graphs',
      '⏳ Export reports',
      '⏳ Trend analysis',
    ],
    reminder: 'Track usage to prevent surprise bills. Set cost alerts in settings.',
  },

  // Developer Context Index
  '/developer/context': {
    title: 'Developer Context Index',
    status: '✅ New Feature',
    docs: [
      { title: 'Developer Reference', path: 'docs/DEVELOPER-REFERENCE.md' },
    ],
    tasks: [
      '✅ Context system created',
      '✅ Index page implemented',
      '⏳ Add more page contexts',
      '⏳ Extend with team coordination',
    ],
    reminder: 'This page aggregates all developer contexts. Keep it current as you work on features.',
  },

  // Loadout Builder
  '/loadout-builder': {
    title: 'Loadout Builder',
    status: '⏳ Not Started',
    docs: [],
    tasks: [
      '⏳ UI layout design',
      '⏳ Weapon/armor/component database',
      '⏳ Load-out calculator',
      '⏳ Save/share configs',
    ],
    reminder: 'Major feature. Needs integration with Star Citizen data. Plan scope carefully.',
  },

  // Economy Tracker
  '/economy-tracker': {
    title: 'Economy Tracker',
    status: '⏳ Not Started',
    docs: [],
    tasks: [
      '⏳ UEX API integration',
      '⏳ Commodity price charts',
      '⏳ Route optimization',
      '⏳ Price alerts',
      '⏳ Trading journal',
    ],
    reminder: 'Community-driven data via UEX API. Plan caching strategy to respect rate limits.',
  },

  // Location Guide
  '/location-guide': {
    title: 'Location Guide',
    status: '⏳ Not Started',
    docs: [],
    tasks: [
      '⏳ Location database',
      '⏳ Interactive map',
      '⏳ POI filtering',
      '⏳ Travel guides',
      '⏳ Faction reputation',
    ],
    reminder: 'Comprehensive reference for verse locations. Requires manual data entry or API integration.',
  },

  // Ship Database
  '/ship-database': {
    title: 'Ship Database',
    status: '⏳ Not Started',
    docs: [],
    tasks: [
      '⏳ Ship specs (speed, cargo, etc)',
      '⏳ Pricing/availability',
      '⏳ Comparison tool',
      '⏳ Loadout integration',
      '⏳ Flight ready status',
    ],
    reminder: 'Critical feature. Star Citizen ships change frequently - plan for data updates.',
  },

  // New Player Guide
  '/new-player-guide': {
    title: 'New Player Guide',
    status: '⏳ In Planning',
    docs: [
      { title: 'Onboarding Checklist', path: 'docs/CHECKLIST-TEMPLATE.md' },
    ],
    tasks: [
      '✅ Placeholder page',
      '⏳ Content structure',
      '⏳ Interactive tutorials',
      '⏳ Progress tracking',
      '⏳ Tips & resources',
    ],
    reminder: 'Immersive onboarding experience. Define learning path from beginner to competent player.',
  },

  // Developer -> Error Log
  '/developer/errors': {
    title: 'Error Log Viewer',
    status: '✅ Working',
    docs: [
      { title: 'Error Handling', path: 'docs/SECURITY.md#error-handling' },
    ],
    tasks: [
      '✅ Log display',
      '✅ Filtering & search',
      '⏳ Export to file',
      '⏳ Error clustering',
    ],
    reminder: 'Critical for debugging. Sanitized to not expose sensitive data.',
  },

  // Developer -> Changes
  '/developer/changes': {
    title: 'Changelog',
    status: '⏳ WIP',
    docs: [],
    tasks: [
      '✅ Changes tracked',
      '⏳ Versioning',
      '⏳ User-facing summaries',
      '⏳ Release notes generation',
    ],
    reminder: 'Keep release notes up to date for users and developers.',
  },

  // Settings
  '/settings': {
    title: 'User Settings',
    status: '⏳ In Development',
    docs: [
      { title: 'Settings Architecture', path: 'docs/DEVELOPER-REFERENCE.md' },
    ],
    tasks: [
      '✅ Theme switcher',
      '⏳ User preferences',
      '⏳ Cost alert thresholds',
      '⏳ API key management',
      '⏳ Export/import config',
    ],
    reminder: 'Use Zustand with localStorage persistence for settings.',
  },

  // Settings -> Theme
  '/settings/theme': {
    title: 'Theme Customization',
    status: '✅ Working',
    docs: [
      { title: 'Theme Lab Guide', path: 'g:\\My Drive\\Project Management\\Live\\OmniCore-Documentation\\START.md' },
    ],
    tasks: [
      '✅ Light/dark toggle',
      '✅ Color presets',
      '⏳ Custom color picker',
      '⏳ CSS variable export',
    ],
    reminder: 'Built with CSS variables. Test across all pages for consistency.',
  },
};

/**
 * Get context for current page
 * @param {string} pathname - Current route pathname
 * @returns {object|null} Context object or null if no context
 */
export function getPageContext(pathname) {
  return developerContext[pathname] || null;
}

/**
 * Get all contexts (for index/map)
 */
export function getAllContexts() {
  return developerContext;
}

/**
 * Get contexts by status (for filtering)
 */
export function getContextsByStatus(status) {
  return Object.entries(developerContext)
    .filter(([, context]) => context.status.startsWith(status.substring(0, 2)))
    .reduce((acc, [path, context]) => ({ ...acc, [path]: context }), {});
}
