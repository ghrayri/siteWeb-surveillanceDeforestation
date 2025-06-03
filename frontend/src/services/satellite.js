import axios from 'axios';

const API_URL = '/api';

// Get all satellites
export const getSatellites = async () => {
  try {
    const response = await axios.get(`${API_URL}/satellites/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get satellite by ID
export const getSatelliteById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/satellites/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get satellite images
export const getSatelliteImages = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/satellite-images/`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get satellite image by ID
export const getSatelliteImageById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/satellite-images/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get indices for a satellite image
export const getIndicesForImage = async (imageId) => {
  try {
    const response = await axios.get(`${API_URL}/satellite-images/${imageId}/indices/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all index data
export const getEOData = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/index-analyses/`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get latest indices by type
export const getLatestIndices = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/index-analyses/latest/`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user zones
export const getUserZones = async () => {
  try {
    const response = await axios.get(`${API_URL}/user-zones/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new user zone
export const createUserZone = async (zoneData) => {
  try {
    const response = await axios.post(`${API_URL}/user-zones/`, zoneData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get analyses for a user zone
export const getZoneAnalyses = async (zoneId) => {
  try {
    const response = await axios.get(`${API_URL}/user-zones/${zoneId}/analyses/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};