import api from './api';

export const getAllVehicles = async () => {
  try {
    const response = await api.get('/vehicles');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error occurred' };
  }
};

export const getLiveVehicles = async () => {
  try {
    const response = await api.get('/vehicles/live');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error occurred' };
  }
};

export const getVehicleTelemetry = async (vehicleId, params) => {
  try {
    const response = await api.get(`/vehicles/${vehicleId}/telemetry`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error occurred' };
  }
};
