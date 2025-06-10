import React, { useState } from 'react';
import { FiMapPin, FiClock, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';

const Cinema = ({ movie }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedHall, setSelectedHall] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);

  const handleContinue = () => {
    if (selectedCinema && selectedHall && selectedShowtime) {
      const params = new URLSearchParams({
        cinema: selectedCinema.id,
        hall: selectedHall.id,
        time: selectedShowtime.time,
        date: selectedShowtime.date
      });
      navigate(`/select/${id}?${params.toString()}`);
    }
  };

  if (!movie.cinemas || movie.cinemas.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FiMapPin className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold dark:text-white">Cinema Information</h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold"
          >
            Coming Soon
          </motion.div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          This movie is not yet available for booking. Stay tuned for showtimes!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <FiMapPin className="w-6 h-6 text-red-500" />
        <h2 className="text-2xl font-bold dark:text-white">Select Cinema</h2>
      </div>

      <div className="space-y-6">
        {movie.cinemas.map((cinema) => (
          <div
            key={cinema.id}
            className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              selectedCinema === cinema
                ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700'
            }`}
            onClick={() => {
              setSelectedCinema(cinema);
              setSelectedHall(null);
              setSelectedShowtime(null);
            }}
          >
            <h3 className="font-semibold text-lg mb-2 dark:text-white">
              {cinema.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {cinema.address}
            </p>

            <AnimatePresence>
              {selectedCinema === cinema && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4">
                    {cinema.halls.map((hall) => (
                      <div key={hall.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div 
                          className="flex items-center justify-between mb-3 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHall(selectedHall === hall ? null : hall);
                            setSelectedShowtime(null);
                          }}
                        >
                          <div>
                            <h4 className="font-medium dark:text-white">{hall.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {hall.type} - {hall.capacity} seats
                            </p>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600 dark:text-gray-300">Standard: </span>
                            <span className="font-medium text-red-500">{hall.seatMap.seatTypes.standard.price.toLocaleString()}đ</span>
                            <span className="mx-2">|</span>
                            <span className="text-gray-600 dark:text-gray-300">VIP: </span>
                            <span className="font-medium text-red-500">{hall.seatMap.seatTypes.vip.price.toLocaleString()}đ</span>
                          </div>
                        </div>

                        <AnimatePresence>
                          {selectedHall === hall && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="flex items-center space-x-2 mb-3">
                                <FiClock className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-medium dark:text-white">Available Showtimes</span>
                              </div>
                              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {hall.showtimes.map((showtime, index) => (
                                  <button
                                    key={index}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedShowtime(showtime);
                                    }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                      selectedShowtime === showtime
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-800 dark:text-gray-200'
                                    }`}
                                  >
                                    <div>{showtime.time}</div>
                                    <div className="text-xs opacity-75">{showtime.date}</div>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedCinema && selectedHall && selectedShowtime && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 flex justify-end"
          >
            <button 
              onClick={handleContinue}
              className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            >
              <span>Continue to Seat Selection</span>
              <FiChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cinema; 