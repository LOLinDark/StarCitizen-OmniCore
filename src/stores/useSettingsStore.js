/**
 * Settings Store — user preferences with localStorage persistence.
 *
 * Replaces: manual localStorage for costThreshold, defaultAI, custom theme.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      costThreshold: 10.0,
      defaultAI: 'gemini',
      customTheme: null,

      setCostThreshold: (value) => set({ costThreshold: value }),
      setDefaultAI: (provider) => set({ defaultAI: provider }),
      setCustomTheme: (theme) => set({ customTheme: theme }),
      resetCustomTheme: () => set({ customTheme: null }),
    }),
    { name: 'omni-core-settings' }
  )
);

export default useSettingsStore;
