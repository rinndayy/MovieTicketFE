import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm interceptor để tự động thêm token vào mọi request
axiosInstance.interceptors.request.use(
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

// Thêm interceptor để xử lý response
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Lấy tất cả phim
export const getAllMovies = async () => {
  try {
    const response = await axiosInstance.get('/movies');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy phim theo ID
export const getMovieById = async (id) => {
  try {
    const response = await axiosInstance.get(`/movies/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy phim đang chiếu
export const getNowShowingMovies = async () => {
  try {
    const response = await axiosInstance.get('/movies/now-showing');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy phim sắp chiếu
export const getComingSoonMovies = async () => {
  try {
    const response = await axiosInstance.get('/movies/coming-soon');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Tạo phim mới (Admin)
export const createMovie = async (movieData) => {
  try {
    const response = await axiosInstance.post('/movies', movieData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cập nhật phim (Admin)
export const updateMovie = async (id, movieData) => {
  try {
    const response = await axiosInstance.put(`/movies/${id}`, movieData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Xóa phim (Admin)
export const deleteMovie = async (id) => {
  try {
    const response = await axiosInstance.delete(`/movies/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};