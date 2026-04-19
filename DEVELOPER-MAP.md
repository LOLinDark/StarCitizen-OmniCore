# OMNI-CORE Developer Map

> Quick-reference for AI assistants and developers.
> For the full tag registry see `src/config/devTags.js`.

## Dev Tag System

Tags are short IDs shown in page/section headers when **Dev Mode** is enabled.
They allow instant cross-referencing between code, docs, and conversation.

| Tag | Label | Route | File |
|-----|-------|-------|------|
| DEV01 | Developer Tools | /developer | pages/DeveloperPage.jsx |
| DEV01.1 | Admin Tools (section) | /developer | pages/DeveloperPage.jsx |
| DEV02 | Developer Context Index | /developer/context | pages/DeveloperContextIndexPage.jsx |
| DEV03 | API Test Suite | /developer/api-test | pages/APITestPage.jsx |
| DEV04 | Error Log | /developer/errors | pages/ErrorLogPage.jsx |
| DEV05 | Changes | /developer/changes | pages/ChangesPage.jsx |
| DEV06 | Nav Charts Lab | /developer/nav-charts-lab | pages/DeveloperNavChartsLabPage.jsx |
| ADM01 | Settings | /settings | pages/SettingsPage.jsx |
| ADM02 | Gemini Chat | /admin/chat/gemini | pages/GeminiPage.jsx |
| ADM03 | AI Rules | /admin/ai-rules | pages/AIRulesPage.jsx |
| ADM04 | Analytics Dashboard | /admin/analytics | pages/AnalyticsPage.jsx |
| ADM05 | About | /about | pages/AboutPage.jsx |
| APP01 | Main Dashboard | / | pages/DashboardPage.jsx |
| APP02 | Aerobook | /aerobook | pages/AerobookPage.jsx |
| APP03 | Onboarding Checklist | /onboarding | pages/OnboardingChecklistPage.jsx |
| APP04 | RSI Login | /login | pages/RSILoginPage.jsx |
| GT01 | New Player Guide | /new-player-guide | pages/NewPlayerGuidePage.jsx |
| GT02 | Loadout Builder | /loadout-builder | pages/LoadoutBuilderPage.jsx |
| GT03 | Economy Tracker | /economy-tracker | pages/EconomyTrackerPage.jsx |
| GT04 | Location Guide | /location-guide | pages/LocationGuidePage.jsx |
| GT05 | Ship Database | /ship-database | pages/ShipDatabasePage.jsx |
| HC01 | HOTAS Config (Light) | /theme/hotas-config | pages/theme/HOTASConfigPage.jsx |
| HC03 | HOTAS Config (Dark) | /theme/hotas-config-dark | pages/theme/HOTASConfigPageDark.jsx |
| HC04 | HOTAS Config (Toggle) | /theme/hotas-config-toggle | pages/theme/HOTASConfigPageToggle.jsx |
| HC05 | HOTAS Main | /hotas-config | pages/HOTASConfigMainPage.jsx |
| TL01 | Theme Lab Landing | /theme | pages/ThemePage.jsx |

## Key Architecture Files

| Purpose | File |
|---------|------|
| Tag registry (source of truth) | `src/config/devTags.js` |
| DevTag component | `src/components/DevTag.jsx` |
| Dev Mode state | `src/stores/useAppStore.js` → `devMode` |
| Route config | `src/config/routes.js` |
| Developer context data | `src/data/developerContext.js` |
| Platform core exports | `src/platform-core/index.js` |

## How to Add a New Tag

1. Add entry to `src/config/devTags.js`
2. Import `DevTag` in the target component: `import DevTag from '../components/DevTag';`
3. Place in header: `<Title><DevTag tag="XX01" /> Page Name</Title>`
4. Update this file
