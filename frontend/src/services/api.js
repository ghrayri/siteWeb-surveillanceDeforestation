import axios from "axios";
import { configureAxios } from "./auth";

configureAxios();

const API_URL = "/api";

// Get all regions
export const getRegions = async () => {
  try {
    const response = await axios.get(`${API_URL}/regions/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get region by ID
export const getRegionById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/regions/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all points of interest
export const getPoints = async () => {
  try {
    const response = await axios.get(`${API_URL}/points/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get point by ID
export const getPointById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/points/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all data layers
export const getDataLayers = async () => {
  try {
    const response = await axios.get(`${API_URL}/datalayers/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get data layer by ID
export const getDataLayerById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/datalayers/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

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

// Get all satellite images
export const getSatelliteImages = async () => {
  try {
    const response = await axios.get(`${API_URL}/satellite-images/`);
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

// Get all user zones
export const getUserZones = async () => {
  try {
    const response = await axios.get(`${API_URL}/user-zones/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user zone by ID
export const getUserZoneById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/user-zones/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all index analyses
export const getIndexAnalyses = async () => {
  try {
    const response = await axios.get(`${API_URL}/index-analyses/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get index analysis by ID
export const getIndexAnalysisById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/index-analyses/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all EO data
export const getEoData = async () => {
  try {
    const response = await axios.get(`${API_URL}/eo-data/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get EO data by ID
export const getEoDataById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/eo-data/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all IoT data
export const getIotData = async () => {
  try {
    const response = await axios.get(`${API_URL}/iot-data/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get IoT data by ID
export const getIotDataById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/iot-data/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all real-time data
export const getRealTime = async () => {
  try {
    const response = await axios.get(`${API_URL}/real-time/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get real-time data by ID
export const getRealTimeById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/real-time/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
