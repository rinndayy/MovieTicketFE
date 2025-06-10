import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { movies, seatPrices } from '../../data';
import Day from './Day';
import Seat from './Seat';
import Total from './Total';

const Select = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize movie data to prevent unnecessary re-renders
  const movie = useMemo(() => movies.find(m => m.id === id || m.id === parseInt(id)), [id]);
  const cinema = searchParams.get('cinema');
  const time = searchParams.get('time');
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format date for API
  const formattedDate = selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : 
                        new Date().toISOString().split('T')[0];

  useEffect(() => {
    window.scrollTo(0, 0);
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const calculateTotal = useMemo(() => {
    return selectedSeats.reduce((total, seatId) => {
      const row = seatId.charAt(0);
      const price = row <= 'C' ? seatPrices.premium : seatPrices.standard;
      return total + price;
    }, 0);
  }, [selectedSeats]);

  const handleProceed = () => {
    if (selectedSeats.length > 0) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmBooking = () => {
    navigate(`/payment/${id}?seats=${selectedSeats.join(',')}&cinema=${cinema}&time=${time}&date=${selectedDate || currentDate}&total=${calculateTotal}`);
  };

  // Don't render anything if required data is missing
  if (!id || !cinema || !time) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Missing Required Information</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Please select a movie, cinema, and showtime first.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center"
      >
        <div className="flex flex-col items-center space-y-4">
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
          <p className="text-gray-600 dark:text-gray-300">Loading seat selection...</p>
        </div>
      </motion.div>
    );
  }

  if (!movie) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Movie Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6"
      >
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(`/movie/${id}`)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold mt-4 dark:text-white">{movie.title}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <Day 
                cinema={cinema} 
                date={currentDate} 
                time={time} 
                onDateSelect={setSelectedDate} 
              />
              <Seat 
                onSeatSelect={setSelectedSeats}
                movieId={id}
                cinema={cinema}
                time={time}
                date={formattedDate}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Total
                selectedSeats={selectedSeats}
                onProceed={handleProceed}
                seatPrices={seatPrices}
              />

              {/* Price Legend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
              >
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Seat Prices</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Premium (A-C)</span>
                    <span className="font-medium dark:text-white">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(seatPrices.premium)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Standard (D-G)</span>
                    <span className="font-medium dark:text-white">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(seatPrices.standard)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
              >
                <h3 className="text-xl font-bold mb-4 dark:text-white">Confirm Booking</h3>
                <div className="space-y-4 mb-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    You are about to book {selectedSeats.length} seat(s):
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="font-medium dark:text-white">
                      Seats: {selectedSeats.join(', ')}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                      Total: {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(calculateTotal)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default Select; 