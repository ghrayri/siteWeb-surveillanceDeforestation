import axios from 'axios';

const API_URL = '/api';

// Store token in localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Configure axios with token
export const configureAxios = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Login user
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/token/`, { username, password });
    setToken(response.data.access);
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

// Register user
export const register = async (userData) => {
  try {
    console.log('Registering user:', userData);
    const response = await axios.post(`${API_URL}/register/`, userData);
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/profile/`);
    return response.data;
  } catch (error) {
    console.error('Profile error:', error.response?.data || error.message);
    throw error;
  }
};

// Initialize axios configuration
configureAxios();