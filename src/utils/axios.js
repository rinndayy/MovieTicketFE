import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
instance.interceptors.request.use(
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

// Add a response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', error.response.data);
      throw new Error(error.response.data.message || 'Có lỗi xảy ra');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request error:', error.request);
      throw new Error('Không thể kết nối đến máy chủ');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
      throw new Error('Lỗi khi thiết lập yêu cầu');
    }
  }
);

export default instance;