import { useEffect, useMemo, useState } from 'react';

/**
 * Checks whether the OmniCore local server is reachable.
 * Returns { isChecking, serverAvailable }.
 *
 * - serverAvailable: true  → local Express server is up (full feature set)
 * - serverAvailable: false → no backend (GitHub Pages / demo mode)
 * - isChecking: true       → initial probe not yet complete
 */
export function useServerStatus() {
  const [isChecking, setIsChecking] = useState(true);
  const [serverAvailable, setServerAvailable] = useState(false);

  useEffect(() => {
    let active = true;

    async function probe() {
      try {
        const r = await fetch('/api/version', { method: 'GET', cache: 'no-store' });
        if (active) setServerAvailable(r.ok);
      } catch {
        if (active) setServerAvailable(false);
      } finally {
        if (active) setIsChecking(false);
      }
    }

    probe();
    return () => { active = false; };
  }, []);

  return useMemo(() => ({ isChecking, serverAvailable }), [isChecking, serverAvailable]);
}
