import React, { useRef } from 'react';
import { FiUsers, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Actor = ({ actors }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    const scrollAmount = direction === 'left' ? -300 : 300;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FiUsers className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold dark:text-white">Cast</h2>
        </div>
        
        {actors.length > 3 && (
          <div className="flex space-x-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide"
      >
        <div className="flex space-x-6">
          {actors.map((actor, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 w-48"
            >
              <img
                src={actor.image || 'https://via.placeholder.com/300x400?text=No+Image'}
                alt={actor.name}
                className="w-full h-64 object-cover rounded-lg mb-3"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                }}
              />
              <h3 className="font-semibold mb-1 dark:text-white">{actor.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{actor.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Actor; 