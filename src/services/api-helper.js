// src/services/api-helper.js
import { API_BASE_URL, API_TIMEOUT } from '../config/api';

// Auth token management
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  localStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
  return authToken || localStorage.getItem('authToken');
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('authToken');
};

/**
 * Enhanced API request helper with timeout and retry logic
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<Object>} - Response data
 */
export const apiRequest = async (endpoint, options = {}, retries = 2) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  // Normalize endpoint
// Normalize endpoint
let normalizedEndpoint = endpoint.startsWith('/')
  ? endpoint.slice(1)
  : endpoint;

const url = `${API_BASE_URL}/${normalizedEndpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };  

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Log request in development
  if (import.meta.env.DEV) {
    console.groupCollapsed(`API Request: ${options.method || 'GET'} ${url}`);
    console.log('Options:', { ...options, headers });
    console.groupEnd();
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
      credentials: 'include',
      mode: 'cors'
    });

    clearTimeout(timeoutId);

    // Handle response
    let data;
    const contentType = response.headers.get('content-type');
    
    try {
      data = contentType?.includes('application/json') 
        ? await response.json() 
        : await response.text();
    } catch (error) {
      throw new Error(`Failed to parse response: ${error.message}`);
    }

    if (!response.ok) {
      const error = new Error(data?.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle specific error types
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }

    if (error.message.includes('Failed to fetch')) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return apiRequest(endpoint, options, retries - 1);
      }
      throw new Error('Network error. Please check your internet connection.');
    }

    if (error.status === 401) {
      clearAuthToken();
      throw new Error('Session expired. Please log in again.');
    }

    if (error.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }

    throw error;
  }
};

// Convenience methods
export const apiGet = (endpoint, options = {}) => 
  apiRequest(endpoint, { ...options, method: 'GET' });

export const apiPost = (endpoint, body, options = {}) => 
  apiRequest(endpoint, { 
    ...options, 
    method: 'POST', 
    body: JSON.stringify(body) 
  });

export const apiPut = (endpoint, body, options = {}) => 
  apiRequest(endpoint, { 
    ...options, 
    method: 'PUT', 
    body: JSON.stringify(body) 
  });

export const apiPatch = (endpoint, body, options = {}) => 
  apiRequest(endpoint, { 
    ...options, 
    method: 'PATCH', 
    body: JSON.stringify(body) 
  });

export const apiDelete = (endpoint, options = {}) => 
  apiRequest(endpoint, { ...options, method: 'DELETE' });