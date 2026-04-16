import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePromptStore = create(
  persist(
    (set, get) => ({
      prompts: [],

      setPrompts: (prompts) => set({ prompts: Array.isArray(prompts) ? prompts : [] }),
      upsertPrompt: (prompt) =>
        set((state) => {
          const prompts = [...state.prompts];
          const index = prompts.findIndex((item) => item?.id === prompt?.id && item?.id !== undefined);

          if (index >= 0) {
            prompts[index] = { ...prompts[index], ...prompt };
            return { prompts };
          }

          return { prompts: [...prompts, prompt] };
        }),
      setActivePrompt: (promptId) =>
        set((state) => ({
          prompts: state.prompts.map((prompt) => ({
            ...prompt,
            active: prompt?.id === promptId
          }))
        })),
      clearPrompts: () => set({ prompts: [] }),
      getActivePrompt: () => get().prompts.find((prompt) => prompt?.active) || null
    }),
    { name: 'aiPrompts' }
  )
);

export default usePromptStore;