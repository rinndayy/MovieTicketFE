import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiFilm,
  FiUsers,
  FiCalendar,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiLogOut,
  FiHome
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import * as movieService from '../../services/movieService';
import { toast } from 'react-toastify';
import LoadingAnimation from '../../components/LoadingAnimation';
import movieData from '../data/data.json';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('movies');
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [showEditMovie, setShowEditMovie] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    duration: '',
    genre: [],
    releaseDate: '',
    poster: '',
    banner: '',
    trailer: '',
    storyline: '',
    status: 'coming-soon'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuth = async () => {
    try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

        if (!token || !storedUser) {
          console.error('No token or user found');
          toast.error('Please login to access admin dashboard');
          navigate('/login');
          return;
        }

        if (storedUser.role !== 'admin') {
          console.error('User is not admin:', storedUser);
          toast.error('Access denied. Admin privileges required.');
          navigate('/');
          return;
        }

        // Nếu là admin, fetch data
        await fetchData();
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error('Authentication failed. Please login again.');
        navigate('/login');
      }
    };

    checkAdminAuth();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Lấy phim từ database
      const dbMovies = await movieService.getAllMovies();
      
      // Lấy phim tĩnh từ data.json
      const staticMovies = movieData.movies;
      
      // Kết hợp phim từ database và data.json
      // Nếu phim có cùng title, ưu tiên dùng phim từ database nhưng giữ poster từ data.json nếu cần
      const combinedMovies = [
        ...dbMovies.map(movie => ({
          ...movie,
          poster: getMoviePoster(movie)
        })),
        ...staticMovies.filter(staticMovie => 
          !dbMovies.some(dbMovie => dbMovie.title === staticMovie.title)
        )
      ];

      setMovies(combinedMovies);
    } catch (error) {
      console.error('Error fetching movies:', error);
      // Nếu có lỗi khi lấy dữ liệu từ database, sử dụng data.json
      setMovies(movieData.movies);
      toast.error('Failed to load movies from database, using local data');
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy poster từ data.json nếu phim từ database không có
  const getMoviePoster = (movie) => {
    if (movie.poster) return movie.poster;
    // Tìm phim trong data.json theo title
    const staticMovie = movieData.movies.find(m => m.title === movie.title);
    return staticMovie?.poster || staticMovie?.image || '';
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      // Chuyển đổi duration từ string sang số
      const durationInMinutes = parseInt(newMovie.duration);
      if (isNaN(durationInMinutes)) {
        toast.error('Duration must be a number');
        return;
      }

      const movieData = {
        ...newMovie,
        duration: durationInMinutes,
        genre: newMovie.genre.split(',').map(g => g.trim()), // Chuyển string thành array
        storyline: newMovie.storyline || newMovie.description // Sử dụng storyline nếu có, nếu không thì dùng description
      };

      const response = await movieService.createMovie(movieData);
      toast.success('Movie added successfully');
      setShowAddMovie(false);
      setNewMovie({
        title: '',
        description: '',
        duration: '',
        genre: [],
        releaseDate: '',
        poster: '',
        banner: '',
        trailer: '',
        storyline: '',
        status: 'coming-soon'
      });
      // Refresh danh sách phim
      const updatedMovies = await movieService.getAllMovies();
      setMovies(updatedMovies);
    } catch (error) {
      console.error('Error adding movie:', error);
      toast.error(error.response?.data?.message || 'Failed to add movie');
    }
  };

  const handleDeleteMovie = async (id) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'admin') {
        toast.error('Admin privileges required');
        navigate('/login');
        return;
      }

      if (window.confirm('Are you sure you want to delete this movie?')) {
        await movieService.deleteMovie(id);
        setMovies(movies.filter(movie => movie._id !== id));
        toast.success('Movie deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting movie:', error);
      toast.error(error.message || 'Failed to delete movie');
    }
  };

  const handleEditMovie = async (movieId) => {
    const movieToEdit = movies.find(movie => movie._id === movieId);
    if (movieToEdit) {
      setSelectedMovie(movieToEdit);
      setNewMovie({
        title: movieToEdit.title,
        description: movieToEdit.description,
        duration: movieToEdit.duration,
        genre: movieToEdit.genre,
        releaseDate: movieToEdit.releaseDate,
        poster: movieToEdit.image,
        banner: movieToEdit.bannerImage,
        trailer: movieToEdit.trailer,
        storyline: movieToEdit.storyline,
        status: movieToEdit.status
      });
      setShowEditMovie(true);
    }
  };

  const handleUpdateMovie = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'admin') {
        toast.error('Admin privileges required');
        navigate('/login');
        return;
      }

      // Validate required fields
      if (!newMovie.title || !newMovie.description || !newMovie.duration || 
          !newMovie.genre || !newMovie.releaseDate || !newMovie.poster || !newMovie.trailer) {
        toast.error('Please fill in all required fields');
        return;
      }

      const updatedMovie = await movieService.updateMovie(selectedMovie._id, newMovie);
        setMovies(movies.map(movie => 
          movie._id === selectedMovie._id ? updatedMovie : movie
        ));
        setShowEditMovie(false);
        setSelectedMovie(null);
      toast.success('Movie updated successfully');
    } catch (error) {
      console.error('Error updating movie:', error);
      toast.error(error.message || 'Failed to update movie');
    }
  };

  // Hàm chuyển đổi duration từ "2h 30m" thành số phút
  const convertDurationToMinutes = (duration) => {
    const match = duration.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      return hours * 60 + minutes;
    }
    return 0;
  };

  // Hàm chuyển đổi số phút thành định dạng "2h 30m"
  const convertMinutesToDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Render movie management section
  const renderMoviesTab = () => {
    // Lọc phim theo status
    const nowPlaying = movies.filter(movie => 
      movie.status === 'now-playing' || movie.isNowPlaying
    );
    const comingSoon = movies.filter(movie => 
      movie.status === 'coming-soon' || movie.isComingSoon
    );

  return (
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Movie Management</h2>
              <button
            onClick={() => setShowAddMovie(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600"
              >
            <FiPlus className="mr-2" /> Add Movie
              </button>
            </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Now Showing Movies</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poster</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {nowPlaying.map(movie => (
                  <tr key={movie._id || movie.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img 
                        src={movie.poster || movie.image} 
                        alt={movie.title} 
                        className="h-24 w-16 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150x225?text=No+Image';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{movie.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{movie.duration} min</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(movie.releaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
          <button
                        onClick={() => handleEditMovie(movie._id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FiEdit2 className="inline-block" /> Edit
          </button>
          <button
                        onClick={() => handleDeleteMovie(movie._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="inline-block" /> Delete
          </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
        </div>

            <div>
          <h2 className="text-xl font-bold mb-4">Coming Soon Movies</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poster</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comingSoon.map(movie => (
                  <tr key={movie._id || movie.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img 
                        src={movie.poster || movie.image} 
                        alt={movie.title} 
                        className="h-24 w-16 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150x225?text=No+Image';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{movie.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{movie.duration} min</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(movie.releaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEditMovie(movie._id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FiEdit2 className="inline-block" /> Edit
                </button>
                      <button
                        onClick={() => handleDeleteMovie(movie._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="inline-block" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
              </div>

        {/* Add Movie Modal */}
              {showAddMovie && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Add New Movie</h3>
              <form onSubmit={handleAddMovie}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={newMovie.title}
                      onChange={(e) => setNewMovie({...newMovie, title: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                    <input
                      type="number"
                      value={newMovie.duration}
                      onChange={(e) => setNewMovie({...newMovie, duration: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Genre (comma-separated)</label>
                    <input
                      type="text"
                      value={newMovie.genre}
                      onChange={(e) => setNewMovie({...newMovie, genre: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Action, Drama, Comedy"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Release Date</label>
                    <input
                      type="date"
                      value={newMovie.releaseDate}
                      onChange={(e) => setNewMovie({...newMovie, releaseDate: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Poster URL</label>
                    <input
                      type="url"
                      value={newMovie.poster}
                      onChange={(e) => setNewMovie({...newMovie, poster: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Banner URL</label>
                    <input
                      type="url"
                      value={newMovie.banner}
                      onChange={(e) => setNewMovie({...newMovie, banner: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trailer URL</label>
                    <input
                      type="url"
                      value={newMovie.trailer}
                      onChange={(e) => setNewMovie({...newMovie, trailer: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={newMovie.status}
                      onChange={(e) => setNewMovie({...newMovie, status: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="coming-soon">Coming Soon</option>
                      <option value="now-playing">Now Playing</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newMovie.description}
                      onChange={(e) => setNewMovie({...newMovie, description: e.target.value})}
                      rows="2"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Storyline</label>
                    <textarea
                      value={newMovie.storyline}
                      onChange={(e) => setNewMovie({...newMovie, storyline: e.target.value})}
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddMovie(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Add Movie
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Movie Modal */}
              {showEditMovie && selectedMovie && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Edit Movie</h3>
              <form onSubmit={handleUpdateMovie}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={newMovie.title}
                      onChange={(e) => setNewMovie({...newMovie, title: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                    <input
                      type="number"
                      value={newMovie.duration}
                      onChange={(e) => setNewMovie({...newMovie, duration: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Genre (comma-separated)</label>
                    <input
                      type="text"
                      value={newMovie.genre}
                      onChange={(e) => setNewMovie({...newMovie, genre: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Action, Drama, Comedy"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Release Date</label>
                    <input
                      type="date"
                      value={newMovie.releaseDate}
                      onChange={(e) => setNewMovie({...newMovie, releaseDate: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Poster URL</label>
                    <input
                      type="url"
                      value={newMovie.poster}
                      onChange={(e) => setNewMovie({...newMovie, poster: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Banner URL</label>
                    <input
                      type="url"
                      value={newMovie.banner}
                      onChange={(e) => setNewMovie({...newMovie, banner: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trailer URL</label>
                    <input
                      type="url"
                      value={newMovie.trailer}
                      onChange={(e) => setNewMovie({...newMovie, trailer: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={newMovie.status}
                      onChange={(e) => setNewMovie({...newMovie, status: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="coming-soon">Coming Soon</option>
                      <option value="now-playing">Now Playing</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newMovie.description}
                      onChange={(e) => setNewMovie({...newMovie, description: e.target.value})}
                      rows="2"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Storyline</label>
                    <textarea
                      value={newMovie.storyline}
                      onChange={(e) => setNewMovie({...newMovie, storyline: e.target.value})}
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowEditMovie(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Update Movie
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Tạm thời ẩn các tab Users và Bookings cho đến khi API endpoints được cập nhật
  const renderTabs = () => (
    <div className="flex space-x-4 mb-6">
      <button
        onClick={() => setActiveTab('movies')}
        className={`px-4 py-2 rounded-lg ${
          activeTab === 'movies'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Movies
      </button>
      {/* Tạm thời comment out các tab khác
                                <button
        onClick={() => setActiveTab('users')}
        className={`px-4 py-2 rounded-lg ${
          activeTab === 'users'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Users
                                </button>
                                <button
        onClick={() => setActiveTab('bookings')}
        className={`px-4 py-2 rounded-lg ${
          activeTab === 'bookings'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Bookings
                                </button>
      */}
                              </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'movies':
        return renderMoviesTab();
      // Tạm thời comment out các case khác
      /*
      case 'users':
        return renderUsersTab();
      case 'bookings':
        return renderBookingsTab();
      */
      default:
        return renderMoviesTab();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                </div>
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Welcome, {JSON.parse(localStorage.getItem('user'))?.name || 'Admin'}
                              </span>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
                </div>
            </div>

          {loading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                </div>
          ) : (
            <>
              {renderTabs()}
              {renderContent()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;