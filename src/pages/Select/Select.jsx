import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import movieData from '../data/data.json';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5, when: "beforeChildren" }
  }
};

const screenVariants = {
  hidden: { scaleX: 0 },
  visible: { 
    scaleX: 1,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: custom * 0.1,
      duration: 0.5
    }
  })
};

const summaryVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const Select = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [movie, setMovie] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedHall, setSelectedHall] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  // Get parameters from URL
  const cinemaId = searchParams.get('cinema');
  const hallId = searchParams.get('hall');
  const time = searchParams.get('time');
  const date = searchParams.get('date');

  useEffect(() => {
    // Find movie from static data
    const foundMovie = movieData.movies.find(m => m.id === id);
    if (foundMovie) {
      setMovie(foundMovie);
      
      // Find selected cinema and hall
      const cinema = foundMovie.cinemas.find(c => c.id === cinemaId);
      if (cinema) {
        setSelectedCinema(cinema);
        const hall = cinema.halls.find(h => h.id === hallId);
        if (hall) {
          setSelectedHall(hall);
        }
      }
    }
  }, [id, cinemaId, hallId]);

  const handleSeatClick = (row, col) => {
    const seatId = `${row}${col}`;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  useEffect(() => {
    if (selectedHall && selectedSeats.length > 0) {
      let price = 0;
      selectedSeats.forEach(seat => {
        const row = seat.charAt(0);
        const isVipSeat = selectedHall.seatMap.vipRows.includes(row);
        price += isVipSeat ? selectedHall.seatMap.seatTypes.vip.price : selectedHall.seatMap.seatTypes.standard.price;
      });
      setTotalPrice(price);
    } else {
      setTotalPrice(0);
    }
  }, [selectedSeats, selectedHall]);

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;

    const bookingData = {
      movieId: movie.id,
      movieTitle: movie.title,
      cinema: selectedCinema.name,
      hall: selectedHall.name,
      date,
      time,
      seats: selectedSeats,
      totalAmount: totalPrice
    };

    navigate('/payment', {
      state: { bookingData }
    });
  };

  if (!movie || !selectedCinema || !selectedHall) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-900 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => navigate(`/movie/${id}`)}
              className="flex items-center text-white hover:text-red-500 transition-colors mb-4"
            >
              <FiArrowLeft className="w-6 h-6 mr-2" />
              <span>Back to Movie</span>
            </button>
            <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
            <div className="mt-2 text-gray-400">
              <p>{selectedCinema.name} - {selectedHall.name}</p>
              <p>{time} - {date}</p>
            </div>
          </motion.div>

          {/* Screen */}
          <motion.div 
            className="relative mb-12"
            variants={screenVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="w-full h-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg mb-2" />
            <p className="text-center text-gray-400 text-sm">Screen</p>
          </motion.div>

          {/* Seat Map */}
          <div className="mb-8">
            <div className="grid grid-cols-10 gap-2 max-w-3xl mx-auto">
              {selectedHall.seatMap.rows.map((row, rowIndex) => (
                <motion.div
                  key={row}
                  custom={rowIndex}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="contents"
                >
                  {Array.from({ length: selectedHall.seatMap.columns }, (_, colIndex) => {
                    const seatId = `${row}${colIndex + 1}`;
                    const isVipSeat = selectedHall.seatMap.vipRows.includes(row);
                    const isSelected = selectedSeats.includes(seatId);

                    return (
                      <motion.button
                        key={seatId}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSeatClick(row, colIndex + 1)}
                        className={`
                          aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors
                          ${isSelected 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/50' 
                            : isVipSeat
                              ? 'bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }
                        `}
                        animate={isSelected ? {
                          scale: [1, 1.2, 1],
                          transition: { duration: 0.3 }
                        } : {}}
                      >
                        {seatId}
                      </motion.button>
                    );
                  })}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <motion.div 
            className="flex justify-center space-x-8 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center">
              <motion.div whileHover={{ scale: 1.1 }} className="w-6 h-6 rounded bg-gray-800 mr-2" />
              <span className="text-gray-400">Standard</span>
            </div>
            <div className="flex items-center">
              <motion.div whileHover={{ scale: 1.1 }} className="w-6 h-6 rounded bg-yellow-600/20 mr-2" />
              <span className="text-gray-400">VIP</span>
            </div>
            <div className="flex items-center">
              <motion.div whileHover={{ scale: 1.1 }} className="w-6 h-6 rounded bg-red-600 mr-2" />
              <span className="text-gray-400">Selected</span>
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div 
            className="bg-gray-800 rounded-lg p-6"
            variants={summaryVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white mb-2">
                  Selected Seats: <span className="text-red-500">{selectedSeats.join(', ')}</span>
                </p>
                <p className="text-white">
                  Total: <span className="text-red-500 text-xl font-bold">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(totalPrice)}
                  </span>
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleProceed}
                disabled={selectedSeats.length === 0}
                className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Payment
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Select;
