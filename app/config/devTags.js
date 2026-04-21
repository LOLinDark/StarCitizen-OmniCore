/**
 * Dev Tag Registry — Single source of truth for all developer reference tags.
 *
 * Tags are short identifiers shown in headers/sections when Dev Mode is enabled.
 * They allow quick cross-referencing between code, docs, and conversation.
 *
 * Convention:
 *   - Page-level tags:  PREFIX + number        e.g. DEV01, HC01, AB01
 *   - Section-level:    PREFIX + number.number  e.g. DEV01.1, HC01.2
 *
 * Usage:
 *   import { DevTag } from '../components/DevTag';
 *   <DevTag tag="DEV01" />
 *
 * To add a new tag: add an entry here, then use <DevTag> in the component.
 */

const devTags = {
  // ── Developer & Admin ──────────────────────────
  DEV01:     { label: 'Developer Tools',        path: '/developer',             file: 'pages/DeveloperPage.jsx' },
  'DEV01.1': { label: 'Admin Tools (section)',   path: '/developer',             file: 'pages/DeveloperPage.jsx' },
  DEV02:     { label: 'Developer Context Index', path: '/developer/context',     file: 'pages/DeveloperContextIndexPage.jsx' },
  DEV03:     { label: 'API Test Suite',          path: '/developer/api-test',    file: 'pages/APITestPage.jsx' },
  DEV04:     { label: 'Error Log',               path: '/developer/errors',      file: 'pages/ErrorLogPage.jsx' },
  DEV05:     { label: 'Changes',                 path: '/developer/changes',     file: 'pages/ChangesPage.jsx' },
  DEV06:     { label: 'Nav Charts Lab',          path: '/developer/nav-charts-lab', file: 'pages/DeveloperNavChartsLabPage.jsx' },

  // ── Admin & Tools ─────────────────────────────
  ADM01:     { label: 'Settings',                path: '/settings',              file: 'pages/SettingsPage.jsx' },
  ADM02:     { label: 'Gemini Chat',             path: '/admin/chat/gemini',     file: 'pages/GeminiPage.jsx' },
  ADM03:     { label: 'AI Rules',                path: '/admin/ai-rules',        file: 'pages/AIRulesPage.jsx' },
  ADM04:     { label: 'Analytics Dashboard',     path: '/admin/analytics',       file: 'pages/AnalyticsPage.jsx' },
  ADM05:     { label: 'About',                   path: '/about',                 file: 'pages/AboutPage.jsx' },

  // ── Main App ──────────────────────────────────
  APP01:     { label: 'Main Dashboard',          path: '/',                      file: 'pages/DashboardPage.jsx' },
  APP02:     { label: 'Aerobook',                path: '/aerobook',              file: 'pages/AerobookPage.jsx' },
  APP03:     { label: 'Onboarding Checklist',    path: '/onboarding',            file: 'pages/OnboardingChecklistPage.jsx' },
  APP04:     { label: 'RSI Login',               path: '/login',                 file: 'pages/RSILoginPage.jsx' },

  // ── Game Tools ────────────────────────────────
  GT01:      { label: 'Training Academy',        path: '/new-player-guide',      file: 'pages/NewPlayerGuidePage.jsx' },
  GT02:      { label: 'Loadout Builder',         path: '/loadout-builder',       file: 'pages/LoadoutBuilderPage.jsx' },
  GT03:      { label: 'Economy Tracker',         path: '/economy-tracker',       file: 'pages/EconomyTrackerPage.jsx' },
  GT04:      { label: 'Nav Charts',          path: '/location-guide',        file: 'pages/LocationGuidePage.jsx' },
  GT05:      { label: 'Ship Database',           path: '/ship-database',         file: 'pages/ShipDatabasePage.jsx' },

  // ── Admin Chat ─────────────────────────────────
  ADM06:     { label: 'Claude Chat',             path: '/admin/chat/claude',          file: 'pages/AmazonQPage.jsx' },
  ADM07:     { label: 'Rate Limit Monitor',      path: '/admin/rate-limits',          file: 'pages/RateLimitPage.jsx' },
  ADM08:     { label: 'Field History',            path: '/admin/history',              file: 'pages/HistoryPage.jsx' },

  // ── HOTAS / Theme Lab ─────────────────────────
  HC01:      { label: 'HOTAS Config (Light)',    path: '/theme/hotas-config',         file: 'pages/theme/HOTASConfigPage.jsx' },
  HC03:      { label: 'HOTAS Config (Dark)',     path: '/theme/hotas-config-dark',    file: 'pages/theme/HOTASConfigPageDark.jsx' },
  HC04:      { label: 'HOTAS Config (Toggle)',   path: '/theme/hotas-config-toggle',  file: 'pages/theme/HOTASConfigPageToggle.jsx' },
  HC05:      { label: 'HOTAS Main',              path: '/hotas-config',               file: 'pages/HOTASConfigMainPage.jsx' },
  'HC-TEST': { label: 'HOTAS Input Test Lab',    path: '/settings/hotas',             file: 'pages/settings/HOTASTestPage.jsx' },
  TL01:      { label: 'Theme Lab Landing',       path: '/theme',                      file: 'pages/ThemePage.jsx' },
};

export default devTags;

/** Get tag metadata by ID */
export const getTag = (id) => devTags[id] || null;

/** Get all tags as entries */
export const getAllTags = () => Object.entries(devTags);

/** Get tags filtered by prefix */
export const getTagsByPrefix = (prefix) =>
  Object.entries(devTags).filter(([id]) => id.startsWith(prefix));
