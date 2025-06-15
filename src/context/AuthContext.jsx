import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:5000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Configure axios defaults
  axios.defaults.baseURL = API_URL;

  // Add auth token to requests if available
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await axios.get('/auth/verify');
        
        if (response.data.success) {
          setUser(response.data.user);
          
          // Auto-redirect if on login/register pages
          const path = window.location.pathname;
          if (path === '/login' || path === '/register') {
            navigate(response.data.user.role === 'admin' ? '/admin' : '/');
          }
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/auth/login', {
        email,
        password
      });

      const { data } = response;

      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);

        // Navigate based on user role
        navigate(data.user.role === 'admin' ? '/admin' : '/');

        return { success: true, user: data.user };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/auth/register', userData);
      const { data } = response;

      if (data.success) {
        // Clear any existing auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Navigate to login page
        navigate('/login');
        
        return { success: true, message: 'Registration successful! Please login.' };
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;