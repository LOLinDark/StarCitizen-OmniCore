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

  console.log('[OmniCore] MainLayout rendered for path:', location.pathname);

  useEffect(() => {
    const path = `${location.pathname}${location.search || ''}`;
    trackAppView(path);
  }, [location.pathname, location.search]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--oc-space-deep)', position: 'relative' }}>
      {/* Header */}
      <AppHeader />

      {/* Aerobook/Bookmarks Bar */}
      <AerobookBar />

      {/* Permanent gradient overlay — positioned below header + bookmark bar, scrolls with content */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '127px',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          background: 'linear-gradient(160deg, rgba(0,4,15,0.60) 0%, rgba(0,4,15,0.80) 100%)',
          pointerEvents: 'none',
          transition: 'background 0.5s ease',
        }}
      />

      {/* Main Content */}
      <Container size="xl" style={{ padding: '2rem 1rem', position: 'relative', zIndex: 1 }}>
        <DeveloperNotes />
        <Outlet />
      </Container>
    </div>
  );
}
