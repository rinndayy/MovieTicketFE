import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Add auth token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getAllTickets = async () => {
  try {
    const response = await axios.get(`${API_URL}/tickets`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTicketById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/tickets/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createTicket = async (ticketData) => {
  try {
    const response = await axios.post(`${API_URL}/tickets`, ticketData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateTicket = async (id, ticketData) => {
  try {
    const response = await axios.put(`${API_URL}/tickets/${id}`, ticketData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteTicket = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/tickets/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTicketsByMovie = async (movieId) => {
  try {
    const response = await axios.get(`${API_URL}/tickets/movie/${movieId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTicketsByUser = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/tickets/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 