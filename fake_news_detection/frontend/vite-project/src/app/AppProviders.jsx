import { AnalysisProvider } from '../context/AnalysisContext';
import { Toaster } from 'react-hot-toast';

/**
 * Wrapper for all app-level providers
 */
export function AppProviders({ children }) {
  return (
    <AnalysisProvider>
      {children}
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f8fafc',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f8fafc',
            },
          },
        }}
      />
    </AnalysisProvider>
  );
}
