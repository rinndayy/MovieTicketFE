import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiInfo } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import movieData from '../data/data.json';

const Seat = ({ onSeatSelect, hall }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seatConfig, setSeatConfig] = useState(null);
  const { token } = useAuth();

  // Load seat configuration from imported data
  const loadSeatConfig = () => {
    try {
      if (!hall || !hall.movieId || !hall.cinema || !hall.date || !hall.time) {
        throw new Error('Missing required hall information');
      }

      const movie = movieData.movies.find(m => m.id === hall.movieId);
      if (!movie) {
        throw new Error('Movie not found');
      }

      const cinema = movie.cinemas.find(c => c.id === hall.cinema);
      if (!cinema) {
        throw new Error('Cinema not found');
      }

      const hallData = cinema.halls.find(h => h.id === hall.id);
      if (!hallData) {
        throw new Error('Hall not found');
      }

      // Check if the hall has the selected showtime
      const hasShowtime = hallData.showtimes.some(
        st => st.date === hall.date && st.time === hall.time
      );
      if (!hasShowtime) {
        throw new Error('Selected showtime not available');
      }

      setSeatConfig(hallData.seatMap);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading seat configuration:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Fetch occupied seats from API
  const fetchOccupiedSeats = async () => {
    if (!hall || !hall.date || !hall.movieId || !hall.cinema || !hall.time) {
      setError('Missing required booking information');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`/api/seats/${hall.movieId}`, {
        params: {
          date: hall.date,
          time: hall.time,
          cinema: hall.cinema,
          hall: hall.id
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const bookedSeats = response.data
        .filter(seat => seat.status === 'booked')
        .map(seat => seat.seatNumber);
      
      setOccupiedSeats(bookedSeats);
    } catch (error) {
      console.error('Error fetching seats:', error);
      // Don't show error for occupied seats, just assume none are occupied
      setOccupiedSeats([]);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    loadSeatConfig();
  }, [hall]);

  useEffect(() => {
    if (!isLoading && !error && seatConfig) {
      fetchOccupiedSeats();
      const pollInterval = setInterval(fetchOccupiedSeats, 30000);
      return () => clearInterval(pollInterval);
    }
  }, [isLoading, error, seatConfig]);

  const handleSeatClick = (seatId) => {
    if (occupiedSeats.includes(seatId)) return;

    setSelectedSeats(prev => {
      const isSelected = prev.includes(seatId);
      const newSelection = isSelected
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId];

      // Maximum 8 seats can be selected
      if (!isSelected && newSelection.length > 8) {
        setError('Maximum 8 seats can be selected at once');
        return prev;
      }

      onSeatSelect(newSelection);
      return newSelection;
    });
  };

  const getSeatStatus = (seatId) => {
    if (occupiedSeats.includes(seatId)) return 'occupied';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };

  const getSeatType = (row) => {
    if (!seatConfig) return 'standard';
    return seatConfig.vipRows.includes(row) ? 'vip' : 'standard';
  };

  const getSeatPrice = (row) => {
    if (!seatConfig) return 0;
    const type = getSeatType(row);
    return seatConfig.seatTypes[type].price;
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        <div className="flex flex-col items-center justify-center h-40 space-y-4">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full"
          />
          <p className="text-gray-600 dark:text-gray-300">Loading seat configuration...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg"
      >
        <p>{error}</p>
        <button
          onClick={() => {
            setError(null);
            setIsLoading(true);
            loadSeatConfig();
          }}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  if (!seatConfig) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
          <FiInfo className="w-5 h-5 mr-2" />
          <p>No seat configuration available</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
    >
      <div className="mb-8">
        <div className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-full mb-4" />
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">Screen</p>
        <p className="text-center text-sm font-medium mt-2 dark:text-white">
          {hall.name} - {hall.type}
        </p>
      </div>

      <div className="space-y-4">
        {seatConfig.rows.map(row => (
          <div key={row} className="flex items-center justify-center space-x-4">
            <span className="w-6 text-center text-gray-500 dark:text-gray-400">{row}</span>
            <div className="flex space-x-4">
              {Array.from({ length: seatConfig.columns }, (_, i) => {
                const seatId = `${row}${i + 1}`;
                const status = getSeatStatus(seatId);
                const type = getSeatType(row);
                
                return (
                  <motion.button
                    key={seatId}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSeatClick(seatId)}
                    disabled={status === 'occupied'}
                    className={`
                      w-10 h-10 rounded-t-lg 
                      ${status === 'occupied'
                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                        : status === 'selected'
                        ? 'bg-red-600 text-white'
                        : type === 'vip'
                        ? 'bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900'
                      } 
                      flex items-center justify-center text-sm font-medium transition-colors relative
                      ${type === 'vip' ? 'border-b-4 border-yellow-400 dark:border-yellow-600' : ''}
                    `}
                  >
                    {i + 1}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex justify-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Standard ({seatConfig.seatTypes.standard.price.toLocaleString()}đ)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded border-b-2 border-yellow-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              VIP ({seatConfig.seatTypes.vip.price.toLocaleString()}đ)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-400 dark:bg-gray-600 rounded" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Occupied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-600 rounded" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Selected</span>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-center text-red-500 mt-4">
            <FiInfo className="w-5 h-5 mr-2" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Seat;
