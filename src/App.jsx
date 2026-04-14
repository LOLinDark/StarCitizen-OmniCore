import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/LayoutNew';
import WelcomePage from './pages/WelcomePage';
import DashboardPage from './pages/DashboardPage';
import { useAppStore } from './stores';
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

function LazyFallback() {
  return <Center h={200}><Loader color="cyan" type="dots" /></Center>;
}

function Lazy({ Component }) {
  return <Suspense fallback={<LazyFallback />}><Component /></Suspense>;
}

function App() {
  const welcomeCompleted = useAppStore((s) => s.welcomeCompleted);
  const completeWelcome = useAppStore((s) => s.completeWelcome);

  return (
    <Routes>
      <Route path="/welcome" element={<WelcomePage onComplete={() => { completeWelcome(); window.location.href = '/'; }} />} />
      {!welcomeCompleted && <Route path="*" element={<Navigate to="/welcome" replace />} />}
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="admin/chat/claude" element={<Lazy Component={AmazonQPage} />} />
        <Route path="admin/chat/gemini" element={<Lazy Component={GeminiPage} />} />
        <Route path="admin/ai-rules" element={<Lazy Component={AIRulesPage} />} />
        <Route path="admin/analytics" element={<Lazy Component={AnalyticsPage} />} />
        <Route path="admin/rate-limits" element={<Lazy Component={RateLimitPage} />} />
        <Route path="admin/history" element={<Lazy Component={HistoryPage} />} />
        <Route path="settings" element={<Lazy Component={SettingsPage} />} />
        <Route path="settings/theme" element={<Lazy Component={ThemePage} />} />
        <Route path="developer" element={<Lazy Component={DeveloperPage} />} />
        <Route path="developer/errors" element={<Lazy Component={ErrorLogPage} />} />
        <Route path="developer/changes" element={<Lazy Component={ChangesPage} />} />
        <Route path="about" element={<Lazy Component={AboutPage} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
