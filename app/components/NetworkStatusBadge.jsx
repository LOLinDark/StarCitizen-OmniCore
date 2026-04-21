import { Badge } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';

function getStatusMeta(browserOnline, backendReachable) {
  if (!browserOnline) {
    return { label: 'OFFLINE', color: '#ff5c5c', glow: 'rgba(255, 92, 92, 0.45)' };
  }

  if (!backendReachable) {
    return { label: 'LIMITED', color: '#ffb648', glow: 'rgba(255, 182, 72, 0.45)' };
  }

  return { label: 'ONLINE', color: '#22d17b', glow: 'rgba(34, 209, 123, 0.45)' };
}

export default function NetworkStatusBadge() {
  const [browserOnline, setBrowserOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [backendReachable, setBackendReachable] = useState(true);

  useEffect(() => {
    function goOnline() {
      setBrowserOnline(true);
    }

    function goOffline() {
      setBrowserOnline(false);
      setBackendReachable(false);
    }

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function checkBackend() {
      if (!navigator.onLine) {
        if (active) {
          setBackendReachable(false);
        }
        return;
      }

      try {
        const response = await fetch('/api/version', { method: 'GET', cache: 'no-store' });
        if (active) {
          setBackendReachable(response.ok);
        }
      } catch {
        if (active) {
          setBackendReachable(false);
        }
      }
    }

    checkBackend();
    const interval = setInterval(checkBackend, 20000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const status = useMemo(() => getStatusMeta(browserOnline, backendReachable), [browserOnline, backendReachable]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        borderRadius: '999px',
        border: `1px solid ${status.color}`,
        backgroundColor: 'rgba(8, 14, 30, 0.92)',
        boxShadow: `0 0 14px ${status.glow}`,
        backdropFilter: 'blur(6px)',
      }}
      aria-live="polite"
      aria-label={`Network status ${status.label.toLowerCase()}`}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: status.color,
          boxShadow: `0 0 8px ${status.glow}`,
        }}
      />
      <Badge size="sm" variant="transparent" style={{ color: status.color, fontWeight: 700, letterSpacing: '0.08em' }}>
        {status.label}
      </Badge>
    </div>
  );
}
