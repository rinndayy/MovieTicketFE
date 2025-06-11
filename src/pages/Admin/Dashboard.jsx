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
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('movies');
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [showEditMovie, setShowEditMovie] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    image: '',
    bannerImage: '',
    rating: 0,
    category: '',
    duration: '',
    releaseDate: '',
    status: 'Now Showing',
    isNowPlaying: true,
    isComingSoon: false,
    censorship: '',
    language: 'Tiếng Việt',
    storyline: '',
    director: {
      name: '',
      image: '',
      description: ''
    },
    actors: [],
    price: '',
    showTimes: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch movies
      const moviesRes = await fetch('http://localhost:5000/api/movies', { headers });
      const moviesData = await moviesRes.json();
      console.log('Movies data:', moviesData); // Debug
      setMovies(Array.isArray(moviesData) ? moviesData.filter(movie => movie && movie.title) : []);

      // Fetch bookings
      const bookingsRes = await fetch('http://localhost:5000/api/bookings/all', { headers });
      const bookingsData = await bookingsRes.json();
      console.log('Bookings data:', bookingsData); // Debug
      setBookings(
        Array.isArray(bookingsData)
          ? bookingsData.filter(
              booking => booking && booking.movie && booking.movie.title && booking.userId && booking.userId.fullName
            )
          : []
      );

      // Fetch users
      const usersRes = await fetch('http://localhost:5000/api/users', { headers });
      const usersData = await usersRes.json();
      console.log('Users data:', usersData); // Debug
      setUsers(Array.isArray(usersData) ? usersData.filter(user => user && user.fullName && user.email) : []);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMovies([]);
      setBookings([]);
      setUsers([]);
      setIsLoading(false);
    }
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Update isNowPlaying and isComingSoon based on status
      const movieToAdd = {
        ...newMovie,
        isNowPlaying: newMovie.status === 'Now Showing',
        isComingSoon: newMovie.status === 'Coming Soon'
      };

      const response = await fetch('http://localhost:5000/api/movies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(movieToAdd)
      });

      if (response.ok) {
        const addedMovie = await response.json();
        setMovies([...movies, addedMovie]);
        setShowAddMovie(false);
        setNewMovie({
          title: '',
          description: '',
          image: '',
          bannerImage: '',
          rating: 0,
          category: '',
          duration: '',
          releaseDate: '',
          status: 'Now Showing',
          isNowPlaying: true,
          isComingSoon: false,
          censorship: '',
          language: 'Tiếng Việt',
          storyline: '',
          director: {
            name: '',
            image: '',
            description: ''
          },
          actors: [],
          price: '',
          showTimes: []
        });
      }
    } catch (error) {
      console.error('Error adding movie:', error);
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/movies/${movieId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setMovies(movies.filter(movie => movie._id !== movieId));
        }
      } catch (error) {
        console.error('Error deleting movie:', error);
      }
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const updatedBooking = await response.json();
        setBookings(bookings.map(booking => 
          booking._id === bookingId ? updatedBooking : booking
        ));
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const handleEditMovie = async (movieId) => {
    const movieToEdit = movies.find(movie => movie._id === movieId);
    if (movieToEdit) {
      setSelectedMovie(movieToEdit);
      setNewMovie({
        title: movieToEdit.title || '',
        description: movieToEdit.description || '',
        image: movieToEdit.image || '',
        bannerImage: movieToEdit.bannerImage || '',
        rating: movieToEdit.rating || 0,
        category: movieToEdit.category || '',
        duration: movieToEdit.duration || '',
        releaseDate: movieToEdit.releaseDate ? movieToEdit.releaseDate.split('T')[0] : '',
        status: movieToEdit.status || 'Now Showing',
        isNowPlaying: movieToEdit.isNowPlaying || true,
        isComingSoon: movieToEdit.isComingSoon || false,
        censorship: movieToEdit.censorship || '',
        language: movieToEdit.language || 'Tiếng Việt',
        storyline: movieToEdit.storyline || '',
        director: {
          name: movieToEdit.director?.name || '',
          image: movieToEdit.director?.image || '',
          description: movieToEdit.director?.description || ''
        },
        actors: Array.isArray(movieToEdit.actors) ? movieToEdit.actors : [],
        price: movieToEdit.price || '',
        showTimes: Array.isArray(movieToEdit.showTimes) ? movieToEdit.showTimes : []
      });
      setShowEditMovie(true);
      setShowAddMovie(false);
    }
  };

  const handleUpdateMovie = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/movies/${selectedMovie._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMovie)
      });

      if (response.ok) {
        const updatedMovie = await response.json();
        setMovies(movies.map(movie => 
          movie._id === selectedMovie._id ? updatedMovie : movie
        ));
        setShowEditMovie(false);
        setSelectedMovie(null);
        setNewMovie({
          title: '',
          description: '',
          image: '',
          bannerImage: '',
          rating: 0,
          category: '',
          duration: '',
          releaseDate: '',
          status: 'Now Showing',
          isNowPlaying: true,
          isComingSoon: false,
          censorship: '',
          language: 'Tiếng Việt',
          storyline: '',
          director: {
            name: '',
            image: '',
            description: ''
          },
          actors: [],
          price: '',
          showTimes: []
        });
      }
    } catch (error) {
      console.error('Error updating movie:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-red-500">
                <FiHome className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-red-500"
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'movies'
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FiFilm />
              <span>Movies</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'users'
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FiUsers />
              <span>Users</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'bookings'
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FiCalendar />
              <span>Bookings</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {activeTab === 'movies' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Movies</h2>
                <button
                  onClick={() => {
                    setShowAddMovie(true);
                    setShowEditMovie(false);
                    setSelectedMovie(null);
                    setNewMovie({
                      title: '',
                      description: '',
                      image: '',
                      bannerImage: '',
                      rating: 0,
                      category: '',
                      duration: '',
                      releaseDate: '',
                      status: 'Now Showing',
                      isNowPlaying: true,
                      isComingSoon: false,
                      censorship: '',
                      language: 'Tiếng Việt',
                      storyline: '',
                      director: {
                        name: '',
                        image: '',
                        description: ''
                      },
                      actors: [],
                      price: '',
                      showTimes: []
                    });
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <FiPlus />
                  <span>Add Movie</span>
                </button>
              </div>

              {showAddMovie && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-4 dark:text-white">Add New Movie</h2>
                    <form onSubmit={handleAddMovie} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                    <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                      <input
                        type="text"
                        value={newMovie.title}
                            onChange={(e) => setNewMovie({...newMovie, title: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                      <input
                        type="text"
                            value={newMovie.category}
                            onChange={(e) => setNewMovie({...newMovie, category: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                      />
                    </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
                          <input
                            type="text"
                            value={newMovie.duration}
                            onChange={(e) => setNewMovie({...newMovie, duration: e.target.value})}
                            placeholder="2h 15m"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Release Date</label>
                          <input
                            type="date"
                            value={newMovie.releaseDate}
                            onChange={(e) => setNewMovie({...newMovie, releaseDate: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                          <select
                            value={newMovie.status}
                            onChange={(e) => setNewMovie({
                              ...newMovie,
                              status: e.target.value,
                              isNowPlaying: e.target.value === 'Now Showing',
                              isComingSoon: e.target.value === 'Coming Soon'
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                            required
                          >
                            <option value="Now Showing">Now Showing</option>
                            <option value="Coming Soon">Coming Soon</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Censorship</label>
                          <input
                            type="text"
                            value={newMovie.censorship}
                            onChange={(e) => setNewMovie({...newMovie, censorship: e.target.value})}
                            placeholder="P - PHIM DÀNH CHO MỌI ĐỐI TƯỢNG"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                      <textarea
                        value={newMovie.description}
                          onChange={(e) => setNewMovie({...newMovie, description: e.target.value})}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                      />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Storyline</label>
                        <textarea
                          value={newMovie.storyline}
                          onChange={(e) => setNewMovie({...newMovie, storyline: e.target.value})}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Poster Image URL</label>
                      <input
                        type="url"
                            value={newMovie.image}
                            onChange={(e) => setNewMovie({...newMovie, image: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-gray-700 dark:text-gray-300">Banner Image URL</label>
                      <input
                        type="url"
                            value={newMovie.bannerImage}
                            onChange={(e) => setNewMovie({...newMovie, bannerImage: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                      />
                    </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-lg font-medium mb-2 dark:text-white">Director Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                    <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Director Name</label>
                      <input
                        type="text"
                              value={newMovie.director.name}
                              onChange={(e) => setNewMovie({
                                ...newMovie,
                                director: { ...newMovie.director, name: e.target.value }
                              })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Director Image URL</label>
                      <input
                              type="url"
                              value={newMovie.director.image}
                              onChange={(e) => setNewMovie({
                                ...newMovie,
                                director: { ...newMovie.director, image: e.target.value }
                              })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                      />
                    </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Director Description</label>
                            <textarea
                              value={newMovie.director.description}
                              onChange={(e) => setNewMovie({
                                ...newMovie,
                                director: { ...newMovie.director, description: e.target.value }
                              })}
                              rows={2}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-lg font-medium mb-2 dark:text-white">Actors</h3>
                        {newMovie.actors.map((actor, index) => (
                          <div key={index} className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Actor Name</label>
                      <input
                                type="text"
                                value={actor.name}
                                onChange={(e) => {
                                  const updatedActors = [...newMovie.actors];
                                  updatedActors[index] = { ...actor, name: e.target.value };
                                  setNewMovie({ ...newMovie, actors: updatedActors });
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Actor Image URL</label>
                              <input
                                type="url"
                                value={actor.image}
                                onChange={(e) => {
                                  const updatedActors = [...newMovie.actors];
                                  updatedActors[index] = { ...actor, image: e.target.value };
                                  setNewMovie({ ...newMovie, actors: updatedActors });
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                              />
                    </div>
                    <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                      <input
                                type="text"
                                value={actor.role}
                                onChange={(e) => {
                                  const updatedActors = [...newMovie.actors];
                                  updatedActors[index] = { ...actor, role: e.target.value };
                                  setNewMovie({ ...newMovie, actors: updatedActors });
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                      />
                    </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setNewMovie({
                            ...newMovie,
                            actors: [...newMovie.actors, { name: '', image: '', role: '' }]
                          })}
                          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Add Actor
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                    <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                      <input
                        type="number"
                        value={newMovie.price}
                            onChange={(e) => setNewMovie({...newMovie, price: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                      />
                    </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={newMovie.rating}
                            onChange={(e) => setNewMovie({...newMovie, rating: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowAddMovie(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Add Movie
                      </button>
                    </div>
                  </form>
                  </div>
                </div>
              )}

              {showEditMovie && selectedMovie && (
                <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Edit Movie</h3>
                  <form onSubmit={handleUpdateMovie} className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <input
                        type="text"
                        value={newMovie.title}
                        onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Director</label>
                      <input
                        type="text"
                        value={newMovie.director.name}
                        onChange={(e) => setNewMovie({
                          ...newMovie,
                          director: { ...newMovie.director, name: e.target.value }
                        })}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={newMovie.description}
                        onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                        className="w-full p-2 border rounded"
                        rows="3"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Poster URL</label>
                      <input
                        type="url"
                        value={newMovie.image}
                        onChange={(e) => setNewMovie({ ...newMovie, image: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Banner URL</label>
                      <input
                        type="url"
                        value={newMovie.bannerImage}
                        onChange={(e) => setNewMovie({ ...newMovie, bannerImage: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Genre</label>
                      <input
                        type="text"
                        value={newMovie.category}
                        onChange={(e) => setNewMovie({ ...newMovie, category: e.target.value })}
                        className="w-full p-2 border rounded"
                        placeholder="Action, Drama, ..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                      <input
                        type="number"
                        value={newMovie.duration}
                        onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Release Date</label>
                      <input
                        type="date"
                        value={newMovie.releaseDate}
                        onChange={(e) => setNewMovie({ ...newMovie, releaseDate: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        value={newMovie.status}
                        onChange={(e) => setNewMovie({ ...newMovie, status: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="Now Showing">Now Showing</option>
                        <option value="Coming Soon">Coming Soon</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Trailer URL</label>
                      <input
                        type="url"
                        value={newMovie.director.image}
                        onChange={(e) => setNewMovie({
                          ...newMovie,
                          director: { ...newMovie.director, image: e.target.value }
                        })}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price</label>
                      <input
                        type="number"
                        value={newMovie.price}
                        onChange={(e) => setNewMovie({ ...newMovie, price: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>

                    {/* Showtimes Management */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Showtimes</label>
                      <div className="space-y-4">
                        {newMovie.showTimes.map((showtime, index) => (
                          <div key={index} className="flex items-center space-x-4 bg-gray-100 dark:bg-gray-600 p-4 rounded-lg">
                            <div className="flex-1">
                              <input
                                type="date"
                                value={showtime.date ? showtime.date.split('T')[0] : ''}
                                onChange={(e) => {
                                  const updatedShowtimes = [...newMovie.showTimes];
                                  updatedShowtimes[index] = {
                                    ...showtime,
                                    date: e.target.value
                                  };
                                  setNewMovie({ ...newMovie, showTimes: updatedShowtimes });
                                }}
                                className="w-full p-2 border rounded"
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                type="text"
                                value={showtime.times ? showtime.times.join(', ') : ''}
                                onChange={(e) => {
                                  const updatedShowtimes = [...newMovie.showTimes];
                                  updatedShowtimes[index] = {
                                    ...showtime,
                                    times: e.target.value.split(',').map(t => t.trim())
                                  };
                                  setNewMovie({ ...newMovie, showTimes: updatedShowtimes });
                                }}
                                placeholder="10:00, 13:30, 17:00, 20:30"
                                className="w-full p-2 border rounded"
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                type="text"
                                value={showtime.cinema || ''}
                                onChange={(e) => {
                                  const updatedShowtimes = [...newMovie.showTimes];
                                  updatedShowtimes[index] = {
                                    ...showtime,
                                    cinema: e.target.value
                                  };
                                  setNewMovie({ ...newMovie, showTimes: updatedShowtimes });
                                }}
                                placeholder="Cinema name"
                                className="w-full p-2 border rounded"
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                type="number"
                                value={showtime.availableSeats || 100}
                                onChange={(e) => {
                                  const updatedShowtimes = [...newMovie.showTimes];
                                  updatedShowtimes[index] = {
                                    ...showtime,
                                    availableSeats: parseInt(e.target.value)
                                  };
                                  setNewMovie({ ...newMovie, showTimes: updatedShowtimes });
                                }}
                                placeholder="Available seats"
                                className="w-full p-2 border rounded"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedShowtimes = newMovie.showTimes.filter((_, i) => i !== index);
                                setNewMovie({ ...newMovie, showTimes: updatedShowtimes });
                              }}
                              className="p-2 text-red-600 hover:text-red-800"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setNewMovie({
                              ...newMovie,
                              showTimes: [
                                ...newMovie.showTimes,
                                {
                                  date: new Date().toISOString().split('T')[0],
                                  times: [],
                                  cinema: '',
                                  availableSeats: 100
                                }
                              ]
                            });
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <FiPlus />
                          <span>Add Showtime</span>
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditMovie(false);
                          setSelectedMovie(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Update Movie
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {movies.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No movies found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b dark:border-gray-700">
                        <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Title</th>
                        <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                        <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Release Date</th>
                        <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Price</th>
                        <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movies
                        .filter(movie =>
                          movie?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false
                        )
                        .map(movie => (
                          <tr key={movie._id} className="border-b dark:border-gray-700">
                            <td className="py-4 text-gray-900 dark:text-white">{movie.title}</td>
                            <td className="py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  movie.status === 'Now Showing'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {movie.status}
                              </span>
                            </td>
                            <td className="py-4 text-gray-600 dark:text-gray-400">
                              {new Date(movie.releaseDate).toLocaleDateString()}
                            </td>
                            <td className="py-4 text-gray-900 dark:text-white">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(movie.price)}
                            </td>
                            <td className="py-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditMovie(movie._id)}
                                  className="p-1 text-blue-600 hover:text-blue-800"
                                >
                                  <FiEdit2 />
                                </button>
                                <button
                                  onClick={() => handleDeleteMovie(movie._id)}
                                  className="p-1 text-red-600 hover:text-red-800"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Bookings</h2>
              {bookings.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No bookings found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b dark:border-gray-700">
                        <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Movie</th>
                        <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">User</th>
                        <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                        <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Seats</th>
                        <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                        <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                        <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings
                        .filter(booking =>
                          (booking?.movie?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
                          (booking?.userId?.fullName?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false)
                        )
                        .map(booking => (
                          <tr key={booking._id} className="border-b dark:border-gray-700">
                            <td className="py-4 text-gray-900 dark:text-white">{booking.movie.title}</td>
                            <td className="py-4 text-gray-600 dark:text-gray-400">{booking.userId.fullName}</td>
                            <td className="py-4 text-gray-600 dark:text-gray-400">
                              {booking.showTime && booking.showTime.date && booking.showTime.time ? (
                                `${new Date(booking.showTime.date).toLocaleDateString()} ${booking.showTime.time}`
                              ) : ''}
                            </td>
                            <td className="py-4 text-gray-600 dark:text-gray-400">
                              {booking.seats.map(seat => `${seat.row}${seat.number}`).join(', ')}
                            </td>
                            <td className="py-4 text-gray-900 dark:text-white">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(booking.totalAmount)}
                            </td>
                            <td className="py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  booking.bookingStatus === 'Completed'
                                    ? 'bg-green-100 text-green-800'
                                    : booking.bookingStatus === 'Cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {booking.bookingStatus}
                              </span>
                            </td>
                            <td className="py-4">
                              <select
                                value={booking.bookingStatus}
                                onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                                className="p-1 border rounded text-sm"
                              >
                                <option value="Active">Active</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Users</h2>
              {users.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b dark:border-gray-700">
                        <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Name</th>
                        <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Email</th>
                        <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Phone</th>
                        <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Role</th>
                        <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Join Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter(user =>
                          (user?.fullName?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false) ||
                          (user?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false)
                        )
                        .map(user => (
                          <tr key={user._id} className="border-b dark:border-gray-700">
                            <td className="py-4 text-gray-900 dark:text-white">{user.fullName}</td>
                            <td className="py-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                            <td className="py-4 text-gray-600 dark:text-gray-400">{user.phone}</td>
                            <td className="py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="py-4 text-gray-600 dark:text-gray-400">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;