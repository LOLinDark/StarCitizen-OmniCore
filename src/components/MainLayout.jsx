import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container } from '@mantine/core';
import AppHeader from './AppHeader';
import AerobookBar from './AerobookBar';
import DeveloperNotes from './DeveloperNotes';
import { trackAppView } from '../platform-core';

export default function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    const path = `${location.pathname}${location.search || ''}`;
    trackAppView(path);
  }, [location.pathname, location.search]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--oc-space-deep)' }}>
      {/* Header */}
      <AppHeader />

      {/* Aerobook/Bookmarks Bar */}
      <AerobookBar />

      {/* Main Content */}
      <Container size="xl" style={{ padding: '2rem 1rem' }}>
        <DeveloperNotes />
        <Outlet />
      </Container>
    </div>
  );
}
