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
    category: '',
    releaseDate: '',
    image: '',
    bannerImage: '',
    rating: 0,
    isNowPlaying: false,
    isComingSoon: false,
    censorship: '',
    language: '',
    storyline: '',
    trailer: '',
    director: {
      name: '',
      image: '',
      description: ''
    },
    actors: []
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
      const moviesData = await movieService.getAllMovies();
      // Chuyển đổi duration từ số phút thành định dạng "2h 30m"
      const formattedMovies = moviesData.map(movie => ({
        ...movie,
        duration: convertMinutesToDuration(movie.duration)
      }));
      setMovies(formattedMovies);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.message?.includes('Not authorized')) {
        toast.error('Session expired. Please login again.');
        logout();
      } else {
        toast.error(error.message || 'Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || storedUser.role !== 'admin') {
        console.error('User is not admin:', storedUser);
        toast.error('Admin privileges required');
        navigate('/login');
        return;
      }

      // Validate required fields
      if (!newMovie.title || !newMovie.description || !newMovie.duration || 
          !newMovie.category || !newMovie.releaseDate || !newMovie.image || 
          !newMovie.bannerImage || !newMovie.trailer) {
        toast.error('Please fill in all required fields including trailer');
        return;
      }

      // Format movie data
      const movieData = {
        ...newMovie,
        duration: convertDurationToMinutes(newMovie.duration),
        poster: newMovie.image,
        isNowPlaying: Boolean(newMovie.isNowPlaying),
        isComingSoon: Boolean(newMovie.isComingSoon),
        rating: Number(newMovie.rating),
        releaseDate: new Date(newMovie.releaseDate).toISOString().split('T')[0],
        director: newMovie.director || {
          name: '',
          image: '',
          description: ''
        },
        actors: newMovie.actors || []
      };

      console.log('Sending movie data:', movieData);
      const addedMovie = await movieService.createMovie(movieData);
      console.log('Response from server:', addedMovie);

      // Update local state with converted duration
      const movieWithFormattedDuration = {
        ...addedMovie,
        duration: convertMinutesToDuration(addedMovie.duration)
      };
      setMovies(prevMovies => [...prevMovies, movieWithFormattedDuration]);

      // Reset form
      setNewMovie({
        title: '',
        description: '',
        duration: '',
        category: '',
        releaseDate: '',
        image: '',
        bannerImage: '',
        rating: 0,
        isNowPlaying: false,
        isComingSoon: false,
        censorship: '',
        language: '',
        storyline: '',
        trailer: '',
        director: {
          name: '',
          image: '',
          description: ''
        },
        actors: []
      });
      setShowAddMovie(false);
      toast.success('Movie added successfully');
    } catch (error) {
      console.error('Error adding movie:', error);
      if (error.message?.includes('Not authorized')) {
        toast.error('Session expired. Please login again.');
        logout();
      } else {
        toast.error(error.message || 'Failed to add movie');
      }
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
        category: movieToEdit.category,
        releaseDate: movieToEdit.releaseDate,
        image: movieToEdit.image,
        bannerImage: movieToEdit.bannerImage,
        rating: movieToEdit.rating,
        isNowPlaying: movieToEdit.isNowPlaying,
        isComingSoon: movieToEdit.isComingSoon,
        censorship: movieToEdit.censorship,
        language: movieToEdit.language,
        storyline: movieToEdit.storyline,
        trailer: movieToEdit.trailer,
        director: movieToEdit.director,
        actors: movieToEdit.actors
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
          !newMovie.category || !newMovie.releaseDate || !newMovie.image || !newMovie.trailer) {
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
  const renderMoviesTab = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Movie Management</h2>
        <button
          onClick={() => setShowAddMovie(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FiPlus className="mr-2" /> Add Movie
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg pl-10"
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Now Showing Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Now Showing</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movies
                .filter(movie => 
                  movie.isNowPlaying &&
                  (movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  movie.category.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map(movie => (
                  <tr key={movie._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-full object-cover" src={movie.image} alt={movie.title} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{movie.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{movie.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{movie.duration}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(movie.releaseDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditMovie(movie._id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
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

      {/* Coming Soon Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Release Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movies
                .filter(movie => 
                  movie.isComingSoon &&
                  (movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  movie.category.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map(movie => (
                  <tr key={movie._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-full object-cover" src={movie.image} alt={movie.title} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{movie.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{movie.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{movie.duration}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(movie.releaseDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditMovie(movie._id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    value={newMovie.category}
                    onChange={(e) => setNewMovie({...newMovie, category: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (e.g. 2h 30m)</label>
                  <input
                    type="text"
                    value={newMovie.duration}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Chỉ cho phép nhập định dạng "Xh Ym"
                      if (/^\d+h\s*\d+m$/.test(value) || value === '') {
                        setNewMovie({...newMovie, duration: value});
                      }
                    }}
                    placeholder="2h 30m"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Release Date</label>
                  <input
                    type="date"
                    value={newMovie.releaseDate}
                    onChange={(e) => setNewMovie({...newMovie, releaseDate: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Poster URL</label>
                  <input
                    type="url"
                    value={newMovie.image}
                    onChange={(e) => setNewMovie({...newMovie, image: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Banner Image URL</label>
                  <input
                    type="url"
                    value={newMovie.bannerImage}
                    onChange={(e) => setNewMovie({...newMovie, bannerImage: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trailer URL</label>
                  <input
                    type="url"
                    value={newMovie.trailer}
                    onChange={(e) => setNewMovie({...newMovie, trailer: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={newMovie.rating}
                    onChange={(e) => setNewMovie({...newMovie, rating: parseFloat(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <input
                    type="text"
                    value={newMovie.language}
                    onChange={(e) => setNewMovie({...newMovie, language: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Censorship</label>
                  <input
                    type="text"
                    value={newMovie.censorship}
                    onChange={(e) => setNewMovie({...newMovie, censorship: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newMovie.description}
                    onChange={(e) => setNewMovie({...newMovie, description: e.target.value})}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Storyline</label>
                  <textarea
                    value={newMovie.storyline}
                    onChange={(e) => setNewMovie({...newMovie, storyline: e.target.value})}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newMovie.isNowPlaying}
                        onChange={(e) => setNewMovie({
                          ...newMovie,
                          isNowPlaying: e.target.checked,
                          isComingSoon: e.target.checked ? false : newMovie.isComingSoon
                        })}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Now Playing</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newMovie.isComingSoon}
                        onChange={(e) => setNewMovie({
                          ...newMovie,
                          isComingSoon: e.target.checked,
                          isNowPlaying: e.target.checked ? false : newMovie.isNowPlaying
                        })}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Coming Soon</span>
                    </label>
                  </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    value={newMovie.category}
                    onChange={(e) => setNewMovie({...newMovie, category: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (e.g. 2h 30m)</label>
                  <input
                    type="text"
                    value={newMovie.duration}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Chỉ cho phép nhập định dạng "Xh Ym"
                      if (/^\d+h\s*\d+m$/.test(value) || value === '') {
                        setNewMovie({...newMovie, duration: value});
                      }
                    }}
                    placeholder="2h 30m"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Release Date</label>
                  <input
                    type="date"
                    value={newMovie.releaseDate}
                    onChange={(e) => setNewMovie({...newMovie, releaseDate: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Poster URL</label>
                  <input
                    type="url"
                    value={newMovie.image}
                    onChange={(e) => setNewMovie({...newMovie, image: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Banner Image URL</label>
                  <input
                    type="url"
                    value={newMovie.bannerImage}
                    onChange={(e) => setNewMovie({...newMovie, bannerImage: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trailer URL</label>
                  <input
                    type="url"
                    value={newMovie.trailer}
                    onChange={(e) => setNewMovie({...newMovie, trailer: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={newMovie.rating}
                    onChange={(e) => setNewMovie({...newMovie, rating: parseFloat(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <input
                    type="text"
                    value={newMovie.language}
                    onChange={(e) => setNewMovie({...newMovie, language: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Censorship</label>
                  <input
                    type="text"
                    value={newMovie.censorship}
                    onChange={(e) => setNewMovie({...newMovie, censorship: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newMovie.description}
                    onChange={(e) => setNewMovie({...newMovie, description: e.target.value})}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Storyline</label>
                  <textarea
                    value={newMovie.storyline}
                    onChange={(e) => setNewMovie({...newMovie, storyline: e.target.value})}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newMovie.isNowPlaying}
                        onChange={(e) => setNewMovie({
                          ...newMovie,
                          isNowPlaying: e.target.checked,
                          isComingSoon: e.target.checked ? false : newMovie.isComingSoon
                        })}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Now Playing</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newMovie.isComingSoon}
                        onChange={(e) => setNewMovie({
                          ...newMovie,
                          isComingSoon: e.target.checked,
                          isNowPlaying: e.target.checked ? false : newMovie.isNowPlaying
                        })}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Coming Soon</span>
                    </label>
                  </div>
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