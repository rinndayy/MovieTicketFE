import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiArrowLeft, FiClock, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import movieData from '../data/data.json';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const showtimesRef = useRef(null);

  // Find movie from static data
  const movie = movieData.movies.find(m => m.id === id);

  // Function to scroll to showtimes section
  const scrollToShowtimes = () => {
    showtimesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    // Simulate loading for smooth transition
    const timer = setTimeout(() => {
      setLoading(false);
      // Set the first available date as default selected
      if (movie && movie.cinemas.length > 0) {
        const firstCinema = movie.cinemas[0];
        if (firstCinema.halls.length > 0) {
          const firstHall = firstCinema.halls[0];
          if (firstHall.showtimes.length > 0) {
            setSelectedDate(firstHall.showtimes[0].date);
          }
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [id, movie]);

  if (loading) {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-900"
    >
      {/* Banner Section */}
      <div className="relative w-full h-[70vh] overflow-hidden">
        <motion.img
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          src={movie.bannerImage || movie.image}
          alt={movie.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/1200x600?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        <motion.button
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 z-10 flex items-center space-x-2 text-white hover:text-red-500 transition-colors"
        >
          <FiArrowLeft className="w-6 h-6" />
          <span className="text-lg">Back</span>
        </motion.button>

        <div className="absolute bottom-0 left-0 w-full p-8">
          <div className="container mx-auto">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              {movie.title}
            </motion.h1>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-6 text-white mb-6"
            >
              <div className="flex items-center space-x-2">
                <FiStar className="w-6 h-6 text-yellow-400" />
                <span className="text-xl">{movie.rating}</span>
              </div>
              <span className="text-lg">{movie.duration}</span>
              <span className="text-lg">{movie.category}</span>
              <span className="text-lg">
                {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </motion.div>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToShowtimes}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Book Tickets
            </motion.button>
          </div>
        </div>
      </div>

      {/* Movie Details */}
      <div className="container mx-auto px-4 py-8">
        {/* Movie Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Movie Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white">
            <div>
              <h3 className="font-semibold mb-2">Category</h3>
              <p className="text-gray-300">{movie.category}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Language</h3>
              <p className="text-gray-300">{movie.language}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Censorship</h3>
              <p className="text-gray-300">{movie.censorship}</p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-white">Storyline</h3>
            <p className="text-gray-300 leading-relaxed">{movie.storyline}</p>
          </div>
        </motion.div>

        {/* Director */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Director</h2>
          <div className="flex items-center space-x-4">
            <img
              src={movie.director.image}
              alt={movie.director.name}
              className="w-24 h-24 rounded-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/96x96?text=No+Image';
              }}
            />
            <div>
              <h3 className="text-xl font-semibold text-white">{movie.director.name}</h3>
              <p className="text-gray-300 mt-2">{movie.director.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Cast */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Cast</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {movie.actors.map((actor, index) => (
              <div key={index} className="text-center">
                <img
                  src={actor.image}
                  alt={actor.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/128x128?text=No+Image';
                  }}
                />
                <h3 className="font-medium text-white">{actor.name}</h3>
                <p className="text-sm text-gray-300">{actor.role}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cinemas and Showtimes */}
        <motion.div
          ref={showtimesRef}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-md rounded-lg p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Cinemas & Showtimes</h2>
          
          {/* Dates Row */}
          {movie.cinemas.length > 0 && movie.cinemas[0].halls.length > 0 && (
            <div className="mb-8">
              <div className="flex overflow-x-auto pb-4 space-x-4 scrollbar-thin scrollbar-thumb-red-500 scrollbar-track-gray-700">
                {[...new Set(movie.cinemas[0].halls[0].showtimes.map(st => st.date))].sort().map(date => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center px-6 py-3 rounded-lg transition-colors ${
                      selectedDate === date
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <FiCalendar className={`w-5 h-5 mb-1 ${selectedDate === date ? 'text-white' : 'text-red-500'}`} />
                    <span className="whitespace-nowrap font-medium">{date}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cinemas and Times */}
          {movie.cinemas.map((cinema) => (
            <div key={cinema.id} className="mb-8 last:mb-0">
              <h3 className="text-xl font-semibold text-white mb-4">{cinema.name}</h3>
              <p className="text-gray-300 mb-4">{cinema.address}</p>
              
              {cinema.halls.map((hall) => (
                <div key={hall.id} className="mb-6 last:mb-0">
                  <h4 className="text-lg font-medium text-white mb-4">
                    {hall.name} - {hall.type}
                  </h4>
                  
                  {/* Show times for selected date */}
                  <div className="flex flex-wrap gap-2 ml-6">
                    {hall.showtimes
                      .filter(st => st.date === selectedDate)
                      .map((showtime, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => navigate(`/select/${movie.id}?cinema=${cinema.id}&hall=${hall.id}&time=${showtime.time}&date=${showtime.date}`)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <FiClock className="w-4 h-4" />
                          <span>{showtime.time}</span>
                        </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MovieDetail;
