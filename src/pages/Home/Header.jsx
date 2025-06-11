import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiClock, FiMapPin, FiSearch, FiMenu, FiX, FiLogOut, FiUser, FiFilm
} from 'react-icons/fi';
import movieData from '../data/data.json';
import { useAuth } from '../../context/AuthContext';

const TicketNotification = ({ ticket, movie, onClick, onDelete }) => (
  <motion.div
    whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
    className="w-full p-4 text-left transition-colors border-b border-gray-200 dark:border-gray-700 relative group"
  >
    <div className="flex space-x-4" onClick={onClick}>
      <div className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={movie?.image || '/fallback-poster.jpg'}
          alt={ticket.movieTitle}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/fallback-poster.jpg';
          }}
        />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 dark:text-white mb-1">{ticket.movieTitle}</h4>
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FiMapPin className="w-4 h-4 mr-1" />
            {ticket.cinema}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FiClock className="w-4 h-4 mr-1" />
            {ticket.time} - {new Date(ticket.date).toLocaleDateString('en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Seats: {ticket.seats.join(', ')}
          </p>
        </div>
      </div>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete(ticket.id);
      }}
      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <FiX className="w-5 h-5" />
    </button>
  </motion.div>
);

const Header = () => {
  const { user, logout } = useAuth();
  const [showTickets, setShowTickets] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  // Load tickets from localStorage and enrich with movie data
  useEffect(() => {
    const loadTickets = () => {
      const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      setTickets(storedTickets);
    };
    loadTickets();
    window.addEventListener('storage', loadTickets);
    return () => window.removeEventListener('storage', loadTickets);
  }, []);

  // Get movie data for a ticket
  const getMovieData = (movieId) => {
    return movieData.movies.find(movie => movie.id === movieId) || null;
  };

  // Debounced search with error handling
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setFilteredMovies([]);
        return;
      }

      // Ensure movieData.movies is an array
      if (!Array.isArray(movieData.movies)) {
        console.error('movieData.movies is not an array:', movieData.movies);
        setFilteredMovies([]);
        return;
      }

      const filtered = movieData.movies.filter(movie => {
        // Ensure movie is an object and has required properties
        if (!movie || typeof movie !== 'object') {
          console.warn('Invalid movie object:', movie);
          return false;
        }

        // Convert fields to strings and handle undefined/null
        const title = movie.title ? String(movie.title).toLowerCase() : '';
        const genre = movie.genre ? String(movie.genre).toLowerCase() : '';
        const description = movie.description ? String(movie.description).toLowerCase() : '';
        const query = searchQuery.toLowerCase();

        return (
          title.includes(query) ||
          genre.includes(query) ||
          description.includes(query)
        );
      }).slice(0, 5); // Limit to 5 results

      setFilteredMovies(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleTicketClick = (ticket) => {
    navigate(`/tickets/${ticket.id}`);
    setShowTickets(false);
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
    setSearchQuery('');
    setShowSearch(false);
    setFilteredMovies([]);
  };

  const handleDeleteTicket = (ticketId) => {
    const updatedTickets = tickets.filter(ticket => ticket.id !== ticketId);
    localStorage.setItem('tickets', JSON.stringify(updatedTickets));
    setTickets(updatedTickets);
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Menu Button */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDrawer(true)}
              className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500"
            >
              <FiMenu className="w-6 h-6" />
            </motion.button>
            <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
              MovieTickets
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* User Profile */}
            {user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfile(!showProfile)}
                  className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500"
                >
                  <FiUser className="w-6 h-6" />
                </motion.button>
                <AnimatePresence>
                  {showProfile && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
                        onClick={() => setShowProfile(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50"
                      >
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                        <div className="p-2">
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            onClick={() => setShowProfile(false)}
                          >
                            <FiUser className="w-4 h-4 mr-2" />
                            Profile
                          </Link>
                          <Link
                            to="/tickets"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            onClick={() => setShowProfile(false)}
                          >
                            <FiFilm className="w-4 h-4 mr-2" />
                            My Tickets
                          </Link>
                          <button
                            onClick={() => {
                              logout();
                              setShowProfile(false);
                              navigate('/login');
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/10 rounded-lg"
                          >
                            <FiLogOut className="w-4 h-4 mr-2" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Login
              </Link>
            )}
            {/* Search */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500"
              >
                <FiSearch className="w-6 h-6" />
              </motion.button>

              <AnimatePresence>
                {showSearch && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
                      onClick={() => setShowSearch(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50"
                    >
                      <div className="p-4">
                        <div className="relative">
                          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search movies..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>

                      {filteredMovies.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 max-h-[60vh] overflow-y-auto">
                          {filteredMovies.map(movie => (
                            <motion.button
                              key={movie.id}
                              whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                              onClick={() => handleMovieClick(movie.id)}
                              className="w-full p-4 text-left flex items-center space-x-4"
                            >
                              <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={movie.image || '/fallback-poster.jpg'}
                                  alt={movie.title || 'Movie'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = '/fallback-poster.jpg';
                                  }}
                                />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {movie.title || 'Untitled'}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {movie.genre || 'Unknown'} • {movie.duration || 'N/A'}
                                </p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Tickets */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTickets(!showTickets)}
                className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500"
              >
                <FiBell className="w-6 h-6" />
                {tickets.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {tickets.length}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {showTickets && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
                      onClick={() => setShowTickets(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold dark:text-white">My Tickets</h3>
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto">
                        {tickets.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No tickets found
                          </div>
                        ) : (
                          tickets.map(ticket => (
                            <TicketNotification
                              key={ticket.id}
                              ticket={ticket}
                              movie={getMovieData(ticket.movieId)}
                              onClick={() => handleTicketClick(ticket)}
                              onDelete={handleDeleteTicket}
                            />
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;