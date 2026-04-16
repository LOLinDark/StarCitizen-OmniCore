/**
 * App Store — global UI state with localStorage persistence.
 *
 * Replaces: DevContext, manual localStorage for colorScheme/devMode.
 * Uses zustand persist middleware — state survives page reloads automatically.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set) => ({
      colorScheme: 'dark',
      devMode: false,
      welcomeCompleted: false,

      setColorScheme: (scheme) => set({ colorScheme: scheme }),
      toggleColorScheme: () => set((s) => ({ colorScheme: s.colorScheme === 'dark' ? 'light' : 'dark' })),
      toggleDevMode: () => set((s) => ({ devMode: !s.devMode })),
      completeWelcome: () => set({ welcomeCompleted: true }),
      resetWelcome: () => set({ welcomeCompleted: false }),

      // Dev activity log (not persisted — see partialize below)
      activities: [],
      logActivity: (type, details) => set((s) => ({
        activities: [
          { id: Date.now(), timestamp: new Date().toLocaleTimeString(), type, details },
          ...s.activities
        ].slice(0, 50)
      })),
    }),
    {
      name: 'omni-core-app',
      // Only persist these keys — activities are ephemeral
      partialize: (state) => ({
        colorScheme: state.colorScheme,
        devMode: state.devMode,
        welcomeCompleted: state.welcomeCompleted,
      }),
    }
  )
);

export default useAppStore;
