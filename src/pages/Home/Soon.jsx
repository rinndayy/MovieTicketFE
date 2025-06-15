import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Soon = ({ movies }) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (movie) => {
    if (!isDragging) {
      const movieId = movie.isFromDatabase ? movie._id : movie.id;
      navigate(`/movie/${movieId}`);
    }
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="py-8 bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold dark:text-white">Coming Soon</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Get ready for these upcoming releases
            </p>
          </div>
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-red-600 hover:text-red-700 font-semibold transition-colors"
          >
            {showAll ? 'Show Less' : 'See All'}
          </button>
        </div>

        <div className="relative">
          <div
            ref={scrollContainerRef}
            className={`${showAll ? '' : 'overflow-x-scroll scrollbar-hide'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <motion.div 
              layout
              className={`flex ${showAll ? 'flex-wrap gap-4' : 'space-x-4'} pb-4`}
            >
              {movies.map((movie) => (
                <motion.div
                  layout
                  key={movie.id}
                  whileHover={{ scale: 1.05 }}
                  className={`flex-shrink-0 ${showAll ? 'w-[calc(33.333%-16px)]' : 'w-64'} cursor-pointer`}
                  onClick={() => handleClick(movie)}
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800">
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className="w-full h-96 object-cover"
                      onError={(e) => (e.currentTarget.src = '/fallback-poster.jpg')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">{movie.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiStar className="w-4 h-4 text-yellow-400" />
                          <span>{movie.rating || '8.5'}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="px-2 py-1 bg-white/20 rounded-lg text-sm mb-1">
                            {movie.duration}
                          </span>
                          <span className="text-sm text-red-400">
                            {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Soon;