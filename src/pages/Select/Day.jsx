import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin } from 'react-icons/fi';

const Day = ({ movie, cinema, time, onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  // Get available dates from the cinema's showtimes
  const availableDates = useMemo(() => {
    const cinemaData = movie.cinemas.find(c => c.id === cinema);
    if (!cinemaData) return [];

    // Get all dates from all halls that have the selected time
    const dates = cinemaData.halls.reduce((acc, hall) => {
      const hallDates = hall.showtimes
        .filter(st => st.time === time)
        .map(st => st.date);
      return [...acc, ...hallDates];
    }, []);

    // Remove duplicates and sort
    return [...new Set(dates)].sort();
  }, [movie, cinema, time]);

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      handleDateSelect(availableDates[0]);
    }
  }, [availableDates]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  const formatDate = (dateStr) => {
    const [day, month] = dateStr.split('-');
    const date = new Date(2024, parseInt(month) - 1, parseInt(day));
    return {
      day: parseInt(day),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      month: date.toLocaleDateString('en-US', { month: 'short' })
    };
  };

  const cinemaData = movie.cinemas.find(c => c.id === cinema);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg mb-6"
      layout
    >
      <div className="flex items-center mb-6">
        <h2 className="text-xl font-bold dark:text-white">Booking Details</h2>
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
            <FiMapPin className="w-5 h-5 text-red-500 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cinema</p>
            <p className="font-medium dark:text-white">{cinemaData?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{cinemaData?.address}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <FiCalendar className="w-5 h-5 text-red-500 dark:text-red-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Select Date</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
            {availableDates.map((date) => {
              const formattedDate = formatDate(date);
              return (
                <motion.button
                  key={date}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDateSelect(date)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedDate === date
                      ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
                      : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'
                  }`}
                  layout
                >
                  <div className="text-lg font-bold">{formattedDate.day}</div>
                  <div className="text-xs opacity-90">{formattedDate.weekday}</div>
                  <div className="text-xs opacity-75">{formattedDate.month}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg"
            layout
          >
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Selected Schedule</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {selectedDate} - {time}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(Day);
