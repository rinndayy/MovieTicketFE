// Banner.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Banner = ({ movies }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!movies || movies.length === 0) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [movies]);

  if (!movies || movies.length === 0) {
    return null;
  }

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 1000 : -1000, opacity: 0 })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => Math.abs(offset) * velocity;

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + movies.length) % movies.length);
  };

  return (
    <div className="relative h-[600px] w-full overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) paginate(1);
            else if (swipe > swipeConfidenceThreshold) paginate(-1);
          }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full">
            <img
              src={movies[currentIndex].bannerImage || movies[currentIndex].image}
              alt={movies[currentIndex].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 text-white max-w-3xl">
              <h2 className="text-5xl font-bold mb-4">{movies[currentIndex].title}</h2>
              <div className="flex items-center space-x-6 mb-6 text-lg">
                <div className="flex items-center">
                  <FiStar className="w-6 h-6 text-yellow-400" />
                  <span className="ml-2">{movies[currentIndex].rating || '8.5'}</span>
                </div>
                <div className="flex items-center">
                  <FiClock className="w-6 h-6" />
                  <span className="ml-2">{movies[currentIndex].duration}</span>
                </div>
                <span className="px-3 py-1 bg-white/20 rounded-lg">{movies[currentIndex].category}</span>
              </div>
              <p className="text-gray-300 mb-6 text-lg line-clamp-2">{movies[currentIndex].description}</p>
              <button 
                onClick={() => navigate(`/movie/${movies[currentIndex].id}`)}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors text-lg"
              >
                Book Now
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors z-10"
        onClick={() => paginate(-1)}
      >
        <FiChevronLeft className="w-7 h-7" />
      </button>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors z-10"
        onClick={() => paginate(1)}
      >
        <FiChevronRight className="w-7 h-7" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
