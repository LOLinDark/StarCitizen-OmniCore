import { create } from 'zustand';

// Rotation index persists per session - increments on each page load/refresh
const getInitialRotationIndex = () => {
  // Store in sessionStorage so it persists while page is open
  // but resets on full page refresh/new tab
  if (typeof window === 'undefined') return 0;
  
  const stored = sessionStorage.getItem('aerobook_rotation_index');
  if (stored !== null) {
    return parseInt(stored, 10);
  }
  return 0;
};

export const useAerobookStore = create((set) => ({
  rotationIndex: getInitialRotationIndex(),
  
  // Increment rotation index for next refresh
  incrementRotation: () => {
    set((state) => {
      const newIndex = state.rotationIndex + 1;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('aerobook_rotation_index', newIndex.toString());
      }
      return { rotationIndex: newIndex };
    });
  },

  // Get video by category index (handles wraparound)
  getVideoIndex: (categoryVideos) => {
    return getInitialRotationIndex() % categoryVideos.length;
  },
}));
