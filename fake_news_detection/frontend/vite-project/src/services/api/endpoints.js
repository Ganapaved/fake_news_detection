import apiClient from './client';

/**
 * Analysis API endpoints
 */
export const analysisApi = {
  /**
   * Analyze news article with text and image
   * @param {FormData} formData - Contains title and image
   * @param {Function} onProgress - Upload progress callback
   * @returns {Promise<Evidence>}
   */
  analyze: async (formData, onProgress) => {
    return apiClient.post('/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  /**
   * Generate AI summary report
   * @param {Object} evidence - Analysis evidence object
   * @returns {Promise<{summary: string}>}
   */
  generateAIReport: async (evidence) => {
    return apiClient.post('/ai_summarise', { evidence });
  },

  /**
   * Get analysis history (future endpoint)
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>}
   */
  getHistory: async (filters = {}) => {
    // TODO: Implement when backend endpoint is ready
    return apiClient.get('/history', { params: filters });
  },

  /**
   * Export analysis report (future endpoint)
   * @param {string} id - Analysis ID
   * @param {string} format - Export format (pdf, json, csv)
   * @returns {Promise<Blob>}
   */
  exportAnalysis: async (id, format = 'pdf') => {
    // TODO: Implement when backend endpoint is ready
    return apiClient.get(`/export/${id}`, {
      params: { format },
      responseType: 'blob',
    });
  },
};

/**
 * Health check endpoint
 */
export const healthApi = {
  check: async () => {
    return apiClient.get('/');
  },
};
