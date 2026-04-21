// History Manager - Tracks all field changes with versioning
import { getStorageKeysByPrefix, readJsonStorage, removeStorageKey, writeJsonStorage } from '../platform-core';

export const historyManager = {
  // Save a field change
  saveChange(documentId, fieldName, value, source = 'user', metadata = {}) {
    const history = this.getHistory(documentId);
    const change = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      fieldName,
      value,
      source, // 'user' or 'ai'
      metadata // { prompt, model, temperature, etc }
    };
    
    if (!history[fieldName]) {
      history[fieldName] = [];
    }
    history[fieldName].push(change);
    
    writeJsonStorage(`history_${documentId}`, history);
    return change.id;
  },

  // Get full history for a document
  getHistory(documentId) {
    return readJsonStorage(`history_${documentId}`, {});
  },

  // Get history for specific field
  getFieldHistory(documentId, fieldName) {
    const history = this.getHistory(documentId);
    return history[fieldName] || [];
  },

  // Get latest value for a field
  getLatest(documentId, fieldName) {
    const fieldHistory = this.getFieldHistory(documentId, fieldName);
    return fieldHistory.length > 0 ? fieldHistory[fieldHistory.length - 1] : null;
  },

  // Rollback to specific version
  rollback(documentId, fieldName, changeId) {
    const history = this.getHistory(documentId);
    const fieldHistory = history[fieldName] || [];
    const index = fieldHistory.findIndex(c => c.id === changeId);
    
    if (index !== -1) {
      const rolledBackValue = fieldHistory[index];
      // Add rollback as new change
      this.saveChange(documentId, fieldName, rolledBackValue.value, 'rollback', {
        rolledBackFrom: changeId,
        originalSource: rolledBackValue.source
      });
      return rolledBackValue.value;
    }
    return null;
  },

  // Get all documents with history
  getAllDocuments() {
    return getStorageKeysByPrefix('history_').map((key) => key.replace('history_', ''));
  },

  // Clear history for document
  clearHistory(documentId) {
    removeStorageKey(`history_${documentId}`);
  }
};
