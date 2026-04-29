import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (email, password) => {
  try {
    const response = await authApi.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error occurred' };
  }
};

export const signup = async (name, email, password, phone) => {
  try {
    const response = await authApi.post('/auth/signup', { name, email, password, phone });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error occurred' };
  }
};
