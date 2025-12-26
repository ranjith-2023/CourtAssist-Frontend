// src/services/httpClient.js
// A simple HTTP client using Fetch API with interceptors for auth and error handling
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const getAccessToken = () => {
  return sessionStorage.getItem('accessToken') || localStorage.getItem('authToken');
};

// Main request function
export const request = async (endpoint, options = {}) => {
  const { method = 'GET', body = null, headers = {}, isPublic = false } = options;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    // Remove credentials: 'include' since we're not using CSRF cookies
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  // Add Authorization header for authenticated requests
  if (!isPublic) {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (response.status === 401 && !isPublic) {
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }

    return await handleResponse(response);
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Optionally, export as httpClient for compatibility
export const httpClient = { request };

// Helper function to handle response parsing and errors
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    let errorData;
    if (contentType?.includes('application/json')) {
      errorData = await response.json();
    } else {
      errorData = { error: await response.text() };
    }
    
    const error = new Error(errorData.error || `HTTP error ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  if (response.status === 204) return null;
  return contentType?.includes('application/json') ? response.json() : response.text();
};
