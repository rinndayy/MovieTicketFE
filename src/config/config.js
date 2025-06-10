// API URL based on environment
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Token key in localStorage
export const TOKEN_KEY = 'movieTicketToken';

// Default image placeholders
export const DEFAULT_MOVIE_POSTER = '/images/movie-placeholder.jpg';
export const DEFAULT_USER_AVATAR = '/images/user-placeholder.jpg';

// Pagination settings
export const ITEMS_PER_PAGE = 12;

// Movie categories
export const MOVIE_CATEGORIES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'War'
];

// Seat pricing
export const SEAT_PRICES = {
  standard: 10,
  premium: 15,
  vip: 20
};

// Time slots
export const TIME_SLOTS = [
  '10:00',
  '12:30',
  '15:00',
  '17:30',
  '20:00',
  '22:30'
]; 