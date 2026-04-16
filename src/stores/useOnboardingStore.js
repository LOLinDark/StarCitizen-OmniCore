import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useOnboardingStore = create(
  persist(
    (set, get) => ({
      // Track completed tasks: { [taskId]: boolean }
      completedTasks: {},

      // Track which sections have been visited
      visitedSections: [],

      // Overall onboarding completion status
      onboardingCompleted: false,

      // Last completed date
      completedDate: null,

      // Toggle task completion
      toggleTask: (taskId, completed) => {
        set((state) => ({
          completedTasks: {
            ...state.completedTasks,
            [taskId]: completed,
          },
        }));
      },

      // Mark section as visited
      visitSection: (sectionId) => {
        set((state) => {
          if (!state.visitedSections.includes(sectionId)) {
            return {
              visitedSections: [...state.visitedSections, sectionId],
            };
          }
          return state;
        });
      },

      // Get completion percentage
      getProgress: (totalTasks) => {
        const completed = Object.values(get().completedTasks).filter(Boolean).length;
        return totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
      },

      // Mark onboarding as complete
      completeOnboarding: () => {
        set({
          onboardingCompleted: true,
          completedDate: new Date().toISOString(),
        });
      },

      // Reset onboarding (for testing)
      resetOnboarding: () => {
        set({
          completedTasks: {},
          visitedSections: [],
          onboardingCompleted: false,
          completedDate: null,
        });
      },
    }),
    {
      name: 'onboarding-storage',
      storage: typeof window !== 'undefined' ? localStorage : undefined,
    }
  )
);
