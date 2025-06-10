import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiPlay, FiClock, FiCalendar } from 'react-icons/fi';
import axios from 'axios';
import Info from './Info';
import Cinema from './Cinema';
import Actor from './Actor';
import movieData from '../data/data.json';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovieAndShowtimes = async () => {
      try {
        const [movieRes, showtimesRes] = await Promise.all([
          axios.get(`/api/movies/${id}`),
          axios.get(`/api/showtimes/movie/${id}`)
        ]);

        setMovie(movieRes.data);
        setShowtimes(showtimesRes.data);

        // Get unique dates from showtimes
        const dates = [...new Set(showtimesRes.data.map(st => st.date.split('T')[0]))];
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieAndShowtimes();
  }, [id]);

  const handleShowtimeSelect = (showtimeId) => {
    navigate(`/select-seats/${showtimeId}`);
  };

  const tabs = [
    { id: 'info', label: 'Information' },
    { id: 'cinema', label: 'Showtimes & Tickets' },
    { id: 'cast', label: 'Cast & Crew' }
  ];

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

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Movie not found</p>
      </div>
    );
  }

  // Filter showtimes by selected date and cinema
  const filteredShowtimes = showtimes.filter(st => {
    const showDate = new Date(st.date).toISOString().split('T')[0];
    return (!selectedDate || showDate === selectedDate) &&
           (!selectedCinema || st.cinema === selectedCinema);
  });

  // Get unique cinemas for the selected date
  const availableCinemas = [...new Set(
    showtimes
      .filter(st => !selectedDate || new Date(st.date).toISOString().split('T')[0] === selectedDate)
      .map(st => st.cinema)
  )];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-900 relative"
    >
      {/* Hero Section with Backdrop */}
      <div
        className="w-full h-[70vh] bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(17,24,39,1)), url(${movie.backdrop || movie.poster})`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0
        }}
      >
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center space-x-2 text-white hover:text-red-500 transition-colors z-10"
        >
          <FiArrowLeft className="w-6 h-6" />
          <span className="text-lg">Back to Home</span>
        </motion.button>

        {/* Movie Poster and Title */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto flex items-end space-x-8">
            <motion.img
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              src={movie.poster}
              alt={movie.title}
              className="w-48 h-72 object-cover rounded-lg shadow-2xl"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex-1"
            >
              <h1 className="text-4xl font-bold text-white mb-4">{movie.title}</h1>
              <div className="flex items-center space-x-4 text-gray-300 mb-4">
                <div className="flex items-center">
                  <FiClock className="mr-2" />
                  <span>{movie.duration} mins</span>
                </div>
                <div className="flex items-center">
                  <FiCalendar className="mr-2" />
                  <span>{new Date(movie.releaseDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genre.map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open(movie.trailer, '_blank')}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors"
              >
                <FiPlay className="w-5 h-5" />
                <span>Watch Trailer</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-8" style={{ marginTop: '65vh' }}>
        <div className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-t-xl p-1">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all
                ${selectedTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {selectedTab === 'info' && <Info movie={movie} />}
            {selectedTab === 'cinema' && <Cinema movie={movie} />}
            {selectedTab === 'cast' && <Actor movie={movie} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MovieDetail;