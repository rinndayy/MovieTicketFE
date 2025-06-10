import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiInfo } from 'react-icons/fi';
import axios from 'axios';

const seatStatus = {
  available: {
    color: '#22C55E',
    label: 'Available'
  },
  occupied: {
    color: '#EF4444',
    label: 'Occupied'
  },
  selected: {
    color: '#3B82F6',
    label: 'Selected'
  },
  disabled: {
    color: '#9CA3AF',
    label: 'Disabled'
  }
};

const SelectSeats = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchShowtime = async () => {
      try {
        const response = await axios.get(`/api/showtimes/${showtimeId}`);
        setShowtime(response.data);
      } catch (error) {
        console.error('Error fetching showtime:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShowtime();
  }, [showtimeId]);

  const handleSeatClick = (row, seat) => {
    if (seat.status !== 'available' || selectedSeats.length >= 8) {
      return;
    }

    const seatKey = `${row.row}${seat.number}`;
    const isSelected = selectedSeats.some(s => s.row === row.row && s.number === seat.number);

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => !(s.row === row.row && s.number === seat.number)));
    } else {
      setSelectedSeats([...selectedSeats, { ...seat, row: row.row }]);
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      return;
    }

    setIsBooking(true);
    try {
      const response = await axios.post('/api/bookings', {
        showtimeId,
        seats: selectedSeats,
        totalAmount: selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
      });

      navigate(`/payment/${response.data._id}`);
    } catch (error) {
      console.error('Booking error:', error);
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
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
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Showtime not found</p>
      </div>
    );
  }

  const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center text-white hover:text-red-500 transition-colors"
          >
            <FiArrowLeft className="w-6 h-6 mr-2" />
            <span>Back</span>
          </motion.button>
          <h1 className="text-3xl font-bold text-white ml-8">Select Seats</h1>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              {/* Screen */}
              <div className="w-full h-8 bg-gray-700 rounded mb-8 flex items-center justify-center">
                <span className="text-gray-400 text-sm">SCREEN</span>
              </div>

              {/* Seats */}
              <div className="grid gap-4">
                {showtime.seats.map((row, rowIndex) => (
                  <div key={row.row} className="flex items-center">
                    <span className="w-8 text-gray-400 text-center">{row.row}</span>
                    <div className="flex-1 grid grid-cols-10 gap-2">
                      {row.seats.map((seat, seatIndex) => {
                        const isSelected = selectedSeats.some(
                          s => s.row === row.row && s.number === seat.number
                        );
                        return (
                          <motion.button
                            key={`${row.row}${seat.number}`}
                            whileHover={{ scale: seat.status === 'available' ? 1.1 : 1 }}
                            whileTap={{ scale: seat.status === 'available' ? 0.9 : 1 }}
                            onClick={() => handleSeatClick(row, seat)}
                            className={`w-8 h-8 rounded-t-lg ${
                              isSelected
                                ? 'bg-blue-500'
                                : seat.status === 'available'
                                ? seat.type === 'vip'
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                                : 'bg-red-500 cursor-not-allowed'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <span className="w-8 text-gray-400 text-center">{row.row}</span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-8 flex items-center justify-center space-x-8">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2" />
                  <span className="text-gray-400">Standard</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2" />
                  <span className="text-gray-400">VIP</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2" />
                  <span className="text-gray-400">Occupied</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2" />
                  <span className="text-gray-400">Selected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-gray-800 rounded-lg p-6 h-fit">
            <h2 className="text-xl font-semibold text-white mb-6">Booking Summary</h2>
            
            {/* Selected Seats */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-gray-300">
                <span>Selected Seats</span>
                <span>{selectedSeats.length}/8</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((seat, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm"
                  >
                    {seat.row}{seat.number}
                  </span>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-4">
              <div className="flex justify-between text-gray-300">
                <span>Tickets ({selectedSeats.length})</span>
                <span>{totalAmount.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Service Fee</span>
                <span>0đ</span>
              </div>
              <div className="border-t border-gray-600 pt-4">
                <div className="flex justify-between text-white font-semibold">
                  <span>Total</span>
                  <span>{totalAmount.toLocaleString()}đ</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-gray-700 rounded-lg flex items-start">
              <FiInfo className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
              <p className="text-gray-400 text-sm">
                You can select up to 8 seats. Selected seats will be held for 5 minutes.
              </p>
            </div>

            {/* Book Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={selectedSeats.length === 0 || isBooking}
              onClick={handleBooking}
              className={`w-full mt-6 py-3 rounded-lg font-semibold ${
                selectedSeats.length > 0 && !isBooking
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
            >
              {isBooking ? 'Processing...' : 'Proceed to Payment'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectSeats; 