import { createContext, useContext, useState, useCallback } from 'react';
import { analysisApi } from '../services/api/endpoints';
import { saveToHistory, getHistory } from '../services/storage/localStorage';
import toast from 'react-hot-toast';

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState(() => getHistory());
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  /**
   * Submit analysis request
   */
  const submitAnalysis = useCallback(async (title, image) => {
    setLoading(true);
    setUploadProgress(0);
    setCurrentAnalysis(null);
    setAiReport(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('image', image);

      const evidence = await analysisApi.analyze(
        formData,
        (progress) => setUploadProgress(progress)
      );

      // Add metadata
      const analysisResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...evidence,
      };

      setCurrentAnalysis(analysisResult);
      
      // Save to history
      const updatedHistory = saveToHistory(analysisResult);
      setAnalysisHistory(updatedHistory);

      toast.success('Analysis completed successfully!');
      return analysisResult;
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }, []);

  /**
   * Generate AI report for current analysis
   */
  const generateAIReport = useCallback(async () => {
    if (!currentAnalysis) {
      toast.error('No analysis available');
      return;
    }

    setAiReportLoading(true);
    try {
      const response = await analysisApi.generateAIReport(currentAnalysis);
      setAiReport(response.summary);
      toast.success('AI report generated!');
      return response.summary;
    } catch (error) {
      console.error('AI report generation failed:', error);
      throw error;
    } finally {
      setAiReportLoading(false);
    }
  }, [currentAnalysis]);

  /**
   * Load analysis from history
   */
  const loadAnalysis = useCallback((id) => {
    const analysis = analysisHistory.find((item) => item.id === id);
    if (analysis) {
      setCurrentAnalysis(analysis);
      setAiReport(null);
    }
  }, [analysisHistory]);

  /**
   * Clear current analysis
   */
  const clearAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
    setAiReport(null);
    setUploadProgress(0);
  }, []);

  /**
   * Delete analysis from history
   */
  const deleteAnalysis = useCallback((id) => {
    const updated = analysisHistory.filter((item) => item.id !== id);
    setAnalysisHistory(updated);
    localStorage.setItem('truthlab_analysis_history', JSON.stringify(updated));
    
    if (currentAnalysis?.id === id) {
      clearAnalysis();
    }
    
    toast.success('Analysis deleted');
  }, [analysisHistory, currentAnalysis, clearAnalysis]);

  const value = {
    currentAnalysis,
    analysisHistory,
    loading,
    uploadProgress,
    aiReportLoading,
    aiReport,
    submitAnalysis,
    generateAIReport,
    loadAnalysis,
    clearAnalysis,
    deleteAnalysis,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

/**
 * Hook to use analysis context
 */
export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider');
  }
  return context;
}
