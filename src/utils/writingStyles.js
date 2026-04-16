// Utility to get AI configuration (rules + styles) for AI system prompts
import { DEFAULT_AI_CONFIG, useAIConfigStore } from '../platform-core';

export const writingStyles = {
  // Get just the style (for backward compatibility)
  get(type) {
    const config = useAIConfigStore.getState().config || DEFAULT_AI_CONFIG;
    return config[type]?.style || DEFAULT_AI_CONFIG.general.style;
  },
  
  // Get the full configuration (rules + style)
  getConfig(type) {
    const config = useAIConfigStore.getState().config || DEFAULT_AI_CONFIG;
    return config[type] || DEFAULT_AI_CONFIG.general;
  },
  
  getAll() {
    return useAIConfigStore.getState().config || DEFAULT_AI_CONFIG;
  }
};
