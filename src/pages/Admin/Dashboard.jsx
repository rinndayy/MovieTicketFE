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
  FiHome,
  FiTicket
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import * as movieService from '../../services/movieService';
import { toast } from 'react-toastify';
import LoadingAnimation from '../../components/LoadingAnimation';
import movieData from '../data/data.json';
import { getAllTickets } from '../../services/ticketService';
import { getAllUsers } from '../../services/userService';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    duration: '',
    genre: '',
    releaseDate: '',
    poster: '',
    trailer: '',
    banner: '',
    storyline: '',
    author: {
      name: '',
      role: 'Director',
      bio: ''
    },
    cast: [
      {
        name: '',
        role: '',
        character: '',
        image: ''
      }
    ],
    status: 'coming-soon',
    seatMap: {
      rows: 8,
      seatsPerRow: 12,
      prices: {
        standard: 75000,
        vip: 95000,
        couple: 150000
      }
    },
    cinemas: [],
    showtimes: []
  });
  const [tickets, setTickets] = useState([]);
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

      // Fetch tickets
      const ticketsData = await getAllTickets();
      setTickets(ticketsData);

      // Fetch users
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
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

  // Lấy thông tin rạp chiếu từ data.json
  const getCinemaData = () => {
    try {
      // Kiểm tra xem movieData và movieData.cinemas có tồn tại không
      if (!movieData || !Array.isArray(movieData.cinemas)) {
        console.error('Invalid cinema data structure');
        return [];
      }

      return movieData.cinemas.map(cinema => ({
        id: cinema.id || `cinema-${Math.random().toString(36).substr(2, 9)}`,
        name: cinema.name || 'Unknown Cinema',
        location: cinema.location || 'Unknown Location',
        rooms: Array.isArray(cinema.rooms) ? cinema.rooms.map(room => ({
          id: room.id || `room-${Math.random().toString(36).substr(2, 9)}`,
          name: room.name || 'Unknown Room',
          capacity: room.capacity || 0
        })) : []
      }));
    } catch (error) {
      console.error('Error loading cinema data:', error);
      return [];
    }
  };

  // Lấy thông tin giá vé từ data.json
  const getDefaultPrices = () => {
    try {
      // Kiểm tra xem có dữ liệu giá vé mặc định không
      const defaultPrices = movieData?.cinemas?.[0]?.rooms?.[0]?.seatMap?.prices;
      if (defaultPrices) {
        return {
          standard: defaultPrices.standard || 75000,
          vip: defaultPrices.vip || 95000,
          couple: defaultPrices.couple || 150000
        };
      }
      // Trả về giá mặc định nếu không tìm thấy trong data.json
      return {
        standard: 75000,
        vip: 95000,
        couple: 150000
      };
    } catch (error) {
      console.error('Error loading default prices:', error);
      return {
        standard: 75000,
        vip: 95000,
        couple: 150000
      };
    }
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const durationInMinutes = parseInt(newMovie.duration);
      if (isNaN(durationInMinutes)) {
        toast.error('Duration must be a number');
        return;
      }

      // Tạo dữ liệu phim với thông tin rạp chiếu và giá vé
      const movieData = {
        ...newMovie,
        duration: durationInMinutes,
        genre: newMovie.genre.split(',').map(g => g.trim()),
        storyline: newMovie.storyline || newMovie.description,
        cinemas: newMovie.cinemas.length > 0 ? newMovie.cinemas : getCinemaData(),
        seatMap: {
          ...newMovie.seatMap,
          prices: newMovie.seatMap.prices || getDefaultPrices()
        }
      };

      const response = await movieService.createMovie(movieData);
      toast.success('Movie added successfully');
      setShowAddMovie(false);
      setNewMovie({
        title: '',
        description: '',
        duration: '',
        genre: '',
        releaseDate: '',
        poster: '',
        trailer: '',
        banner: '',
        storyline: '',
        author: {
          name: '',
          role: 'Director',
          bio: ''
        },
        cast: [
          {
            name: '',
            role: '',
            character: '',
            image: ''
          }
        ],
        status: 'coming-soon',
        seatMap: {
          rows: 8,
          seatsPerRow: 12,
          prices: getDefaultPrices()
        },
        cinemas: [],
        showtimes: []
      });
      const updatedMovies = await movieService.getAllMovies();
      setMovies(updatedMovies);
    } catch (error) {
      console.error('Error adding movie:', error);
      toast.error(error.response?.data?.message || 'Failed to add movie');
    }
  };

  const handleDeleteMovie = async (movieId) => {
    try {
      await movieService.deleteMovie(movieId);
      toast.success('Movie deleted successfully');
      setShowDeleteConfirm(false);
      setMovieToDelete(null);
      // Refresh movie list
      const updatedMovies = await movieService.getAllMovies();
      setMovies(updatedMovies);
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast.error(error.response?.data?.message || 'Failed to delete movie');
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
        status: movieToEdit.status,
        author: movieToEdit.author,
        cast: movieToEdit.cast,
        seatMap: movieToEdit.seatMap,
        cinemas: movieToEdit.cinemas,
        showtimes: movieToEdit.showtimes
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

  const confirmDelete = (movie) => {
    setMovieToDelete(movie);
    setShowDeleteConfirm(true);
  };

  const handleAddAuthor = () => {
    setNewMovie(prev => ({
      ...prev,
      author: {
        name: '',
        role: 'Director',
        bio: ''
      }
    }));
  };

  const handleAddCast = () => {
    setNewMovie(prev => ({
      ...prev,
      cast: [
        ...prev.cast,
        {
          name: '',
          role: '',
          character: '',
          image: ''
        }
      ]
    }));
  };

  const handleRemoveCast = (index) => {
    setNewMovie(prev => ({
      ...prev,
      cast: prev.cast.filter((_, i) => i !== index)
    }));
  };

  const handleCastChange = (index, field, value) => {
    setNewMovie(prev => ({
      ...prev,
      cast: prev.cast.map((cast, i) => 
        i === index ? { ...cast, [field]: value } : cast
      )
    }));
  };

  const handleAddShowtime = () => {
    setNewMovie(prev => ({
      ...prev,
      showtimes: [
        ...prev.showtimes,
        {
          startTime: '',
          endTime: '',
          hall: ''
        }
      ]
    }));
  };

  const handleRemoveShowtime = (index) => {
    setNewMovie(prev => ({
      ...prev,
      showtimes: prev.showtimes.filter((_, i) => i !== index)
    }));
  };

  const handleShowtimeChange = (index, field, value) => {
    setNewMovie(prev => ({
      ...prev,
      showtimes: prev.showtimes.map((showtime, i) => 
        i === index ? { ...showtime, [field]: value } : showtime
      )
    }));
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
                        onClick={() => confirmDelete(movie)}
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
                        onClick={() => confirmDelete(movie)}
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && movieToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
              <p className="mb-4">Are you sure you want to delete "{movieToDelete.title}"?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setMovieToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteMovie(movieToDelete._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Movie Modal */}
        {showAddMovie && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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

                  {/* Thông tin tác giả */}
                  <div className="col-span-2 border-t pt-4">
                    <h4 className="text-lg font-semibold mb-4">Author Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Author Name</label>
                        <input
                          type="text"
                          value={newMovie.author.name}
                          onChange={(e) => setNewMovie({...newMovie, author: { ...newMovie.author, name: e.target.value }})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Author Role</label>
                        <input
                          type="text"
                          value={newMovie.author.role}
                          onChange={(e) => setNewMovie({...newMovie, author: { ...newMovie.author, role: e.target.value }})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Author Bio</label>
                        <textarea
                          value={newMovie.author.bio}
                          onChange={(e) => setNewMovie({...newMovie, author: { ...newMovie.author, bio: e.target.value }})}
                          rows="2"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thông tin diễn viên */}
                  <div className="col-span-2 border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold">Cast Information</h4>
                      <button
                        type="button"
                        onClick={handleAddCast}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Add Cast Member
                      </button>
                    </div>
                    {newMovie.cast.map((cast, index) => (
                      <div key={index} className="border rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-start mb-4">
                          <h5 className="text-md font-medium text-gray-900">Cast Member {index + 1}</h5>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCast(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                              type="text"
                              value={cast.name}
                              onChange={(e) => handleCastChange(index, 'name', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <input
                              type="text"
                              value={cast.role}
                              onChange={(e) => handleCastChange(index, 'role', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Character</label>
                            <input
                              type="text"
                              value={cast.character}
                              onChange={(e) => handleCastChange(index, 'character', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Image URL</label>
                            <input
                              type="url"
                              value={cast.image}
                              onChange={(e) => handleCastChange(index, 'image', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Thông tin suất chiếu */}
                  <div className="col-span-2 border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold">Showtimes</h4>
                      <button
                        type="button"
                        onClick={handleAddShowtime}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Add Showtime
                      </button>
                    </div>
                    {newMovie.showtimes.map((showtime, index) => (
                      <div key={index} className="border rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-start mb-4">
                          <h5 className="text-md font-medium text-gray-900">Showtime {index + 1}</h5>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveShowtime(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Start Time</label>
                            <input
                              type="datetime-local"
                              value={showtime.startTime}
                              onChange={(e) => handleShowtimeChange(index, 'startTime', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">End Time</label>
                            <input
                              type="datetime-local"
                              value={showtime.endTime}
                              onChange={(e) => handleShowtimeChange(index, 'endTime', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Hall</label>
                            <input
                              type="text"
                              value={showtime.hall}
                              onChange={(e) => handleShowtimeChange(index, 'hall', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cinema and Pricing Section */}
                  <div className="col-span-2 border-t pt-4 mt-4">
                    <h4 className="text-lg font-semibold mb-4">Cinema and Pricing Information</h4>
                    
                    {/* Seat Map Configuration */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Number of Rows</label>
                        <input
                          type="number"
                          value={newMovie.seatMap.rows}
                          onChange={(e) => setNewMovie({
                            ...newMovie,
                            seatMap: {
                              ...newMovie.seatMap,
                              rows: parseInt(e.target.value)
                            }
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="1"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Seats per Row</label>
                        <input
                          type="number"
                          value={newMovie.seatMap.seatsPerRow}
                          onChange={(e) => setNewMovie({
                            ...newMovie,
                            seatMap: {
                              ...newMovie.seatMap,
                              seatsPerRow: parseInt(e.target.value)
                            }
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    {/* Pricing Configuration */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Standard Seat Price (VND)</label>
                        <input
                          type="number"
                          value={newMovie.seatMap.prices.standard}
                          onChange={(e) => setNewMovie({
                            ...newMovie,
                            seatMap: {
                              ...newMovie.seatMap,
                              prices: {
                                ...newMovie.seatMap.prices,
                                standard: parseInt(e.target.value)
                              }
                            }
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">VIP Seat Price (VND)</label>
                        <input
                          type="number"
                          value={newMovie.seatMap.prices.vip}
                          onChange={(e) => setNewMovie({
                            ...newMovie,
                            seatMap: {
                              ...newMovie.seatMap,
                              prices: {
                                ...newMovie.seatMap.prices,
                                vip: parseInt(e.target.value)
                              }
                            }
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Couple Seat Price (VND)</label>
                        <input
                          type="number"
                          value={newMovie.seatMap.prices.couple}
                          onChange={(e) => setNewMovie({
                            ...newMovie,
                            seatMap: {
                              ...newMovie.seatMap,
                              prices: {
                                ...newMovie.seatMap.prices,
                                couple: parseInt(e.target.value)
                              }
                            }
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    {/* Cinema Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Cinemas</label>
                      <div className="grid grid-cols-2 gap-4">
                        {getCinemaData().map(cinema => (
                          <div key={cinema.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`cinema-${cinema.id}`}
                              checked={newMovie.cinemas.some(c => c.id === cinema.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewMovie({
                                    ...newMovie,
                                    cinemas: [...newMovie.cinemas, cinema]
                                  });
                                } else {
                                  setNewMovie({
                                    ...newMovie,
                                    cinemas: newMovie.cinemas.filter(c => c.id !== cinema.id)
                                  });
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`cinema-${cinema.id}`} className="ml-2 block text-sm text-gray-900">
                              {cinema.name} - {cinema.location}
                            </label>
                          </div>
                        ))}
                      </div>
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

  const renderTicketsTab = () => {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Ticket Management</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Movie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Showtime</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map(ticket => (
                <tr key={ticket._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.movie?.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.user?.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(ticket.showtime?.startTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ticket.seats?.map(seat => seat.seatNumber).join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">${ticket.totalPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      ticket.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      ticket.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderUsersTab = () => {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">User Management</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

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
      <button
        onClick={() => setActiveTab('tickets')}
        className={`px-4 py-2 rounded-lg ${
          activeTab === 'tickets'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Tickets
      </button>
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
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'movies':
        return renderMoviesTab();
      case 'tickets':
        return renderTicketsTab();
      case 'users':
        return renderUsersTab();
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