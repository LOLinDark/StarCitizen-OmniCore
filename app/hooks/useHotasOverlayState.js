import { useState, useEffect, useRef, useCallback } from 'react';

// Custom hook for HOTAS overlay state and dev mode persistence
export function useHotasOverlayState(initialOverlays = []) {
  const [overlays, setOverlays] = useState(initialOverlays);
  const [devEditMode, setDevEditMode] = useState(() => {
    try {
      const saved = localStorage.getItem('hotasOverlayDevEditMode');
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return true;
  });

  // Save overlays to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('hotasOverlayPositions', JSON.stringify(overlays));
    } catch (e) {}
  }, [overlays]);

  // Save devEditMode to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('hotasOverlayDevEditMode', devEditMode ? 'true' : 'false');
    } catch (e) {}
  }, [devEditMode]);

  return { overlays, setOverlays, devEditMode, setDevEditMode };
}
