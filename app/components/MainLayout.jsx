import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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
      {/* Sticky Header + Bookmarks Bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <AppHeader />
        <AerobookBar />
      </div>

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
      <div style={{ padding: '2rem 3%', position: 'relative', zIndex: 1, maxWidth: '100%' }}>
        <DeveloperNotes />
        <Outlet />
      </div>

      {/* Made By The Community badge */}
      <img
        src="/assets/branding/MadeByTheCommunity_White.png"
        alt="Made by the Community"
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          width: 100,
          opacity: 0.4,
          pointerEvents: 'none',
          zIndex: 50,
        }}
      />
    </div>
  );
}
