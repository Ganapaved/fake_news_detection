// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  TIMEOUT: 60000, // 60 seconds for ML processing
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Werugo TruthLab',
  APP_DESCRIPTION: 'Digital Forensic News Analysis',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'],
  HISTORY_STORAGE_KEY: 'truthlab_analysis_history',
  MAX_HISTORY_ITEMS: 100,
};

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/',
  NEW_ANALYSIS: '/analyze/new',
  ANALYSIS_RESULT: '/analyze/:id',
  HISTORY: '/history',
  REPORTS: '/reports',
  SETTINGS: '/settings',
};

// Claim Types
export const CLAIM_TYPES = [
  'politics',
  'government policy',
  'elections',
  'crime',
  'sports',
  'business',
  'health',
  'entertainment',
  'technology',
  'international',
  'social issues',
];
