import api from './api';

// Vehicle CRUD
export const getVehicles = (params) => api.get('/vehicles', { params });
export const getVehicleById = (id) => api.get(`/vehicles/${id}`);
export const addVehicle = (data) => api.post('/vehicles', data);
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);

// Vehicle Types
export const getVehicleTypes = () => api.get('/vehicle-types');
export const addVehicleType = (data) => api.post('/vehicle-types', data);
export const updateVehicleType = (id, data) => api.put(`/vehicle-types/${id}`, data);
export const deleteVehicleType = (id) => api.delete(`/vehicle-types/${id}`);

// Type Icons
export const getTypeIcons = (typeId) => api.get(`/vehicle-types/${typeId}/icons`);
export const updateTypeIcon = (typeId, data) => api.post(`/vehicle-types/${typeId}/icons`, data);

// Image Upload
export const uploadImage = (formData) => api.post('/upload/icon', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
