import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminLayout from './components/LayoutNew';
import MainLayout from './components/MainLayout';
import DevPanel from './components/DevPanel';
import RSILoginPage from './pages/RSILoginPage';
import DashboardPage from './pages/DashboardPage';
import MainDashboardPage from './pages/MainDashboardPage';
import AerobookPage from './pages/AerobookPage';
import OnboardingChecklistPage from './pages/OnboardingChecklistPage';
import NewPlayerGuidePage from './pages/NewPlayerGuidePage';
import LoadoutBuilderPage from './pages/LoadoutBuilderPage';
import EconomyTrackerPage from './pages/EconomyTrackerPage';
import LocationGuidePage from './pages/LocationGuidePage';
import HOTASConfigMainPage from './pages/HOTASConfigMainPage';
import HOTASConfigModesLabPage from './pages/HOTASConfigModesLabPage';
import NetworkStatusBadge from './components/NetworkStatusBadge';
import ShipDatabasePage from './pages/ShipDatabasePage';
import { trackAppView, installGlobalErrorHandlers, startPerformanceMonitoring, useAppStore } from './platform-core';
import { Loader, Center } from '@mantine/core';

const AmazonQPage = lazy(() => import('./pages/AmazonQPage'));
const GeminiPage = lazy(() => import('./pages/GeminiPage'));
const AIRulesPage = lazy(() => import('./pages/AIRulesPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const RateLimitPage = lazy(() => import('./pages/RateLimitPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ThemePage = lazy(() => import('./pages/ThemePage'));
const DeveloperPage = lazy(() => import('./pages/DeveloperPage'));
const ChangesPage = lazy(() => import('./pages/ChangesPage'));
const ErrorLogPage = lazy(() => import('./pages/ErrorLogPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const APITestPage = lazy(() => import('./pages/APITestPage'));
const DeveloperContextIndexPage = lazy(() => import('./pages/DeveloperContextIndexPage'));
const DeveloperNavChartsLabPage = lazy(() => import('./pages/DeveloperNavChartsLabPage'));
const DeveloperHotasProfileMatrixLabPage = lazy(() => import('./pages/DeveloperHotasProfileMatrixLabPage'));

// Theme Lab Pages
const WelcomeOnline = lazy(() => import('./pages/theme/WelcomeOnline'));
const StarCitizenDetail = lazy(() => import('./pages/theme/StarCitizenDetail'));
const Squadron42Detail = lazy(() => import('./pages/theme/Squadron42Detail'));
const HOTASConfigPage = lazy(() => import('./pages/theme/HOTASConfigPage'));
const HOTASConfigPageDark = lazy(() => import('./pages/theme/HOTASConfigPageDark'));
const HOTASConfigPageToggle = lazy(() => import('./pages/theme/HOTASConfigPageToggle'));
const HOTASTestPage = lazy(() => import('./pages/settings/HOTASTestPage'));

function LazyFallback() {
  return <Center h={200}><Loader color="cyan" type="dots" /></Center>;
}

function Lazy({ Component }) {
  return <Suspense fallback={<LazyFallback />}><Component /></Suspense>;
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

  return (
    <>
      <NetworkStatusBadge />
      <DevPanel />
      <RuntimeObservers />
      <Routes>
        {/* Theme Lab Routes - Public, no auth required */}
        <Route path="/theme" element={<Lazy Component={WelcomeOnline} />} />
        <Route path="/theme/star-citizen" element={<Lazy Component={StarCitizenDetail} />} />
        <Route path="/theme/squadron-42" element={<Lazy Component={Squadron42Detail} />} />
        <Route path="/theme/hotas-config" element={<Lazy Component={HOTASConfigPage} />} />
        <Route path="/theme/hotas-config-dark" element={<Lazy Component={HOTASConfigPageDark} />} />
        <Route path="/theme/hotas-config-toggle" element={<Lazy Component={HOTASConfigPageToggle} />} />
        <Route path="/theme/hotas-test" element={<Navigate to="/settings/hotas" replace />} />

        {/* Login and Dashboard Routes */}
        <Route path="/login" element={<RSILoginPage onComplete={() => { completeWelcome(); window.location.href = '/'; }} />} />
        {!welcomeCompleted && <Route path="*" element={<Navigate to="/login" replace />} />}
        
        {/* Main User-Facing Dashboard & Feature Pages (with MainLayout) */}
        <Route element={<MainLayout />}>
          <Route index element={<MainDashboardPage />} />
          <Route path="aerobook" element={<AerobookPage />} />
          <Route path="new-player-guide" element={<NewPlayerGuidePage />} />
          <Route path="loadout-builder" element={<LoadoutBuilderPage />} />
          <Route path="economy-tracker" element={<EconomyTrackerPage />} />
          <Route path="location-guide" element={<LocationGuidePage />} />
          <Route path="hotas-config" element={<HOTASConfigMainPage />} />
          <Route path="hotas-config-modes-lab" element={<HOTASConfigModesLabPage />} />
          <Route path="ship-database" element={<ShipDatabasePage />} />
        </Route>

        {/* Admin/Backend/Settings Area (with AdminLayout - Legacy WIP view) */}
        <Route element={<AdminLayout />}>
          <Route path="dashboard-old" element={<DashboardPage />} />
          <Route path="onboarding" element={<OnboardingChecklistPage />} />
          <Route path="admin/chat/claude" element={<Lazy Component={AmazonQPage} />} />
          <Route path="admin/chat/gemini" element={<Lazy Component={GeminiPage} />} />
          <Route path="admin/ai-rules" element={<Lazy Component={AIRulesPage} />} />
          <Route path="admin/analytics" element={<Lazy Component={AnalyticsPage} />} />
          <Route path="admin/rate-limits" element={<Lazy Component={RateLimitPage} />} />
          <Route path="admin/history" element={<Lazy Component={HistoryPage} />} />
          <Route path="settings" element={<Lazy Component={SettingsPage} />} />
          <Route path="settings/hotas" element={<Lazy Component={HOTASTestPage} />} />
          <Route path="settings/theme" element={<Lazy Component={ThemePage} />} />
          <Route path="developer" element={<Lazy Component={DeveloperPage} />} />
          <Route path="developer/context" element={<Lazy Component={DeveloperContextIndexPage} />} />
          <Route path="developer/errors" element={<Lazy Component={ErrorLogPage} />} />
          <Route path="developer/changes" element={<Lazy Component={ChangesPage} />} />
          <Route path="developer/api-test" element={<Lazy Component={APITestPage} />} />
          <Route path="developer/nav-charts-lab" element={<Lazy Component={DeveloperNavChartsLabPage} />} />
          <Route path="developer/hotas-modes-lab" element={<HOTASConfigModesLabPage />} />
          <Route path="developer/hotas-profile-matrix-lab" element={<Lazy Component={DeveloperHotasProfileMatrixLabPage} />} />
          <Route path="about" element={<Lazy Component={AboutPage} />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
