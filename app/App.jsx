import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminLayout from './components/LayoutNew';
import MainLayout from './components/MainLayout';
import DevPanel from './components/DevPanel';
import { trackAppView, installGlobalErrorHandlers, startPerformanceMonitoring, useAppStore } from './platform-core';
import { Loader, Center } from '@mantine/core';


const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const RSILoginPage = lazy(() => import('./pages/RSILoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MainDashboardPage = lazy(() => import('./pages/MainDashboardPage'));
const AerobookPage = lazy(() => import('./pages/AerobookPage'));
const OnboardingChecklistPage = lazy(() => import('./pages/OnboardingChecklistPage'));
const LoadoutBuilderPage = lazy(() => import('./pages/LoadoutBuilderPage'));
const EconomyTrackerPage = lazy(() => import('./pages/EconomyTrackerPage'));
const LocationGuidePage = lazy(() => import('./pages/LocationGuidePage'));
const ShipDatabasePage = lazy(() => import('./pages/ShipDatabasePage'));
const GameSettingsPage = lazy(() => import('./pages/GameSettingsPage'));

const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ThemePage = lazy(() => import('./pages/ThemePage'));
const DeveloperPage = lazy(() => import('./pages/DeveloperPage'));
const ChangesPage = lazy(() => import('./pages/ChangesPage'));
const ErrorLogPage = lazy(() => import('./pages/ErrorLogPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ScreenshotsPage = lazy(() => import('./pages/ScreenshotsPage'));
const APITestPage = lazy(() => import('./pages/APITestPage'));
const AcademyFeatureLibraryPage = lazy(() => import('./pages/AcademyFeatureLibraryPage'));
const AcademyHubPage = lazy(() => import('./pages/AcademyHubPage'));
const NewPlayerGuidePage = lazy(() => import('./pages/NewPlayerGuidePage'));
const HOTASConfigMainPage = lazy(() => import('./pages/HOTASConfigMainPage'));
const DeveloperContextIndexPage = lazy(() => import('./pages/DeveloperContextIndexPage'));
const DeveloperNavChartsLabPage = lazy(() => import('./pages/DeveloperNavChartsLabPage'));
const HOTASDiagramPage = lazy(() => import('./pages/HOTASDiagramPage'));
const HOTASOverlayPage = lazy(() => import('./pages/HOTASOverlayPage'));
const HOTASOverlaySaveTestPage = lazy(() => import('./pages/HOTASOverlaySaveTestPage'));
const HOTASCommunityTestingPage = lazy(() => import('./pages/HOTASCommunityTestingPage'));
const DeveloperHotasDataFlowPage = lazy(() => import('./pages/DeveloperHotasDataFlowPage'));


// Theme Lab Pages
const WelcomeOnline = lazy(() => import('./pages/theme/WelcomeOnline'));
const StarCitizenDetail = lazy(() => import('./pages/theme/StarCitizenDetail'));
const Squadron42Detail = lazy(() => import('./pages/theme/Squadron42Detail'));
const PlaceholderSamplesPage = lazy(() => import('./pages/theme/PlaceholderSamplesPage'));
const HOTASTestPage = lazy(() => import('./pages/settings/HOTASTestPage'));

function LazyFallback() {
  return <Center h={200}><Loader color="cyan" type="dots" /></Center>;
}

function Lazy({ Component, componentProps }) {
  return <Suspense fallback={<LazyFallback />}><Component {...(componentProps || {})} /></Suspense>;
}

function RuntimeObservers() {
  const location = useLocation();

  useEffect(() => {
    installGlobalErrorHandlers();
    startPerformanceMonitoring();
  }, []);

  useEffect(() => {
    const path = `${location.pathname}${location.search || ''}`;
    trackAppView(path);
  }, [location.hash, location.pathname, location.search]);

  return null;
}

function App() {
  const welcomeCompleted = useAppStore((s) => s.welcomeCompleted);
  const completeWelcome = useAppStore((s) => s.completeWelcome);

  console.log('[OmniCore] App.jsx rendering, welcomeCompleted:', welcomeCompleted);

  return (
    <>
      <DevPanel />
      <RuntimeObservers />
      <Routes>
        {/* Theme Lab Routes - Public, no auth required */}
        <Route path="/theme" element={<Lazy Component={WelcomeOnline} />} />
        <Route path="/theme/star-citizen" element={<Lazy Component={StarCitizenDetail} />} />
        <Route path="/theme/squadron-42" element={<Lazy Component={Squadron42Detail} />} />
        <Route path="/theme/placeholder-samples" element={<Lazy Component={PlaceholderSamplesPage} />} />
        <Route path="/theme/hotas-test" element={<Navigate to="/settings/hotas" replace />} />

        {/* Login Route */}
        <Route
          path="/login"
          element={<Lazy Component={RSILoginPage} componentProps={{ onComplete: () => { completeWelcome(); window.location.href = import.meta.env.BASE_URL; } }} />}
        />
        
        {/* Main User-Facing Dashboard & Feature Pages (with MainLayout) */}
        <Route element={<MainLayout />}>
          <Route index element={<Lazy Component={MainDashboardPage} />} />
          <Route path="aerobook" element={<Lazy Component={AerobookPage} />} />
          <Route path="new-player-guide" element={<Lazy Component={NewPlayerGuidePage} />} />
          <Route path="academy" element={<Lazy Component={AcademyHubPage} />} />
          <Route path="academy/feature-library" element={<Lazy Component={AcademyFeatureLibraryPage} />} />
          <Route path="academy/:track" element={<Lazy Component={NewPlayerGuidePage} />} />
          <Route path="academy/:track/:shipId" element={<Lazy Component={NewPlayerGuidePage} />} />
          <Route path="loadout-builder" element={<Lazy Component={LoadoutBuilderPage} />} />
          <Route path="economy-tracker" element={<Lazy Component={EconomyTrackerPage} />} />
          <Route path="location-guide" element={<Lazy Component={LocationGuidePage} />} />
          <Route path="hotas-config" element={<Lazy Component={HOTASConfigMainPage} />} />
          <Route path="hotas-testing-routine" element={<Lazy Component={HOTASCommunityTestingPage} />} />
          <Route path="ship-database" element={<Lazy Component={ShipDatabasePage} />} />
          <Route path="game-settings" element={<Lazy Component={GameSettingsPage} />} />
          <Route path="settings" element={<Lazy Component={SettingsPage} />} />
          <Route path="settings/hotas" element={<Lazy Component={HOTASTestPage} />} />
          <Route path="settings/theme" element={<Lazy Component={ThemePage} />} />
          <Route path="about" element={<Lazy Component={AboutPage} />} />
          <Route path="screenshots" element={<Lazy Component={ScreenshotsPage} />} />
          <Route path="hotas-diagram" element={<Lazy Component={HOTASDiagramPage} />} />
        </Route>

        {/* Admin/Backend/Developer Area (with AdminLayout - Sidebar layout) */}
        <Route element={<AdminLayout />}>
          <Route path="dashboard-old" element={<Lazy Component={DashboardPage} />} />
          <Route path="onboarding" element={<Lazy Component={OnboardingChecklistPage} />} />

          <Route path="admin/history" element={<Lazy Component={HistoryPage} />} />
          <Route path="developer" element={<Lazy Component={DeveloperPage} />} />
          <Route path="developer/context" element={<Lazy Component={DeveloperContextIndexPage} />} />
          <Route path="developer/errors" element={<Lazy Component={ErrorLogPage} />} />
          <Route path="developer/changes" element={<Lazy Component={ChangesPage} />} />
          <Route path="developer/api-test" element={<Lazy Component={APITestPage} />} />
          <Route path="developer/nav-charts-lab" element={<Lazy Component={DeveloperNavChartsLabPage} />} />
          <Route path="developer/hotas-overlay-save-test" element={<Lazy Component={HOTASOverlaySaveTestPage} />} />
          <Route path="developer/hotas-data-flow" element={<Lazy Component={DeveloperHotasDataFlowPage} />} />
        </Route>

        {/* Fallback: Always allow access, guard at component level if needed */}
        <Route path="*" element={<Navigate to={welcomeCompleted ? "/" : "/login"} replace />} />
      </Routes>
    </>
  );
}

export default App;
