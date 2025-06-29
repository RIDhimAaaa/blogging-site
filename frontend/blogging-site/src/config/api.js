// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  SIGNUP: `${API_BASE_URL}/auth/signup`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  REFRESH: `${API_BASE_URL}/auth/refresh`,
  PROFILE: `${API_BASE_URL}/auth/profile`,
  VERIFY_EMAIL: (token) => `${API_BASE_URL}/auth/verify-email/${token}`,
  RESET_PASSWORD_REQUEST: `${API_BASE_URL}/auth/reset-password-request`,
  RESET_PASSWORD: (token) => `${API_BASE_URL}/auth/reset-password/${token}`,
  
  // Blog endpoints
  BLOGS: `${API_BASE_URL}/blogs`,
  BLOG_DETAIL: (id) => `${API_BASE_URL}/blogs/${id}`,
  BLOG_COMMENTS: (id) => `${API_BASE_URL}/blogs/${id}/comments`,
  
  // User endpoints
  USERS: `${API_BASE_URL}/users`,
  USER_PROFILE: (id) => `${API_BASE_URL}/users/${id}`,
  
  // Comment endpoints
  COMMENTS: `${API_BASE_URL}/comments`,
  
  // Like endpoints
  LIKES: `${API_BASE_URL}/likes`,
  
  // Follow endpoints
  FOLLOWS: `${API_BASE_URL}/follows`,
};

export const APP_CONFIG = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'BlogSite',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  API_BASE_URL,
};

export default API_ENDPOINTS;
