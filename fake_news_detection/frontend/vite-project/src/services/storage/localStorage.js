import { APP_CONFIG } from '../../config/constants';

/**
 * Save analysis to localStorage history
 * @param {Object} analysis - Analysis result to save
 * @returns {Array} Updated history array
 */
export function saveToHistory(analysis) {
  try {
    const history = getHistory();
    
    // Add new analysis at the beginning
    const updated = [analysis, ...history];
    
    // Limit history size
    const limited = updated.slice(0, APP_CONFIG.MAX_HISTORY_ITEMS);
    
    localStorage.setItem(
      APP_CONFIG.HISTORY_STORAGE_KEY,
      JSON.stringify(limited)
    );
    
    return limited;
  } catch (error) {
    console.error('Failed to save to history:', error);
    return [];
  }
}

/**
 * Get analysis history from localStorage
 * @returns {Array} Array of past analyses
 */
export function getHistory() {
  try {
    const stored = localStorage.getItem(APP_CONFIG.HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

/**
 * Clear all history
 */
export function clearHistory() {
  try {
    localStorage.removeItem(APP_CONFIG.HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}

/**
 * Get single analysis by ID
 * @param {string} id - Analysis ID
 * @returns {Object|null} Analysis object or null
 */
export function getAnalysisById(id) {
  const history = getHistory();
  return history.find((item) => item.id === id) || null;
}

/**
 * Delete analysis by ID
 * @param {string} id - Analysis ID to delete
 * @returns {Array} Updated history
 */
export function deleteAnalysisById(id) {
  try {
    const history = getHistory();
    const updated = history.filter((item) => item.id !== id);
    
    localStorage.setItem(
      APP_CONFIG.HISTORY_STORAGE_KEY,
      JSON.stringify(updated)
    );
    
    return updated;
  } catch (error) {
    console.error('Failed to delete analysis:', error);
    return getHistory();
  }
}
