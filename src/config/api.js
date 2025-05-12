export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://webstrategy.co.in/rssdi/api'  // ← Removed trailing space
  : '/api';

export const API_TIMEOUT = 30000;