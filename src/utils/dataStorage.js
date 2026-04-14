// Data Storage Manager - Stores structured nursery content data

export const dataStorage = {
  // Save complete observation data
  saveObservation(documentId, data) {
    const key = `data_${documentId}_observation`;
    localStorage.setItem(key, JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
      type: 'observation'
    }));
  },

  // Save complete story data
  saveStory(documentId, data) {
    const key = `data_${documentId}_story`;
    localStorage.setItem(key, JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
      type: 'story'
    }));
  },

  // Save complete responsive plan data
  saveResponsivePlan(documentId, data) {
    const key = `data_${documentId}_responsive`;
    localStorage.setItem(key, JSON.stringify({
      ...data,
      timestamp: new Date().toISOString(),
      type: 'responsive'
    }));
  },

  // Get observation
  getObservation(documentId) {
    const key = `data_${documentId}_observation`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  },

  // Get story
  getStory(documentId) {
    const key = `data_${documentId}_story`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  },

  // Get responsive plan
  getResponsivePlan(documentId) {
    const key = `data_${documentId}_responsive`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  },

  // Get most recent content type
  getMostRecent(documentId) {
    const obs = this.getObservation(documentId);
    const story = this.getStory(documentId);
    const responsive = this.getResponsivePlan(documentId);

    const items = [
      obs ? { ...obs, key: 'observation' } : null,
      story ? { ...story, key: 'story' } : null,
      responsive ? { ...responsive, key: 'responsive' } : null
    ].filter(Boolean);

    if (items.length === 0) return null;

    items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return items[0];
  },

  // Clear all data for document
  clearDocument(documentId) {
    localStorage.removeItem(`data_${documentId}_observation`);
    localStorage.removeItem(`data_${documentId}_story`);
    localStorage.removeItem(`data_${documentId}_responsive`);
  }
};
