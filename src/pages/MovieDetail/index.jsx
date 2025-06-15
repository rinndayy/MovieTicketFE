import React from 'react';
import { FiClock, FiCalendar, FiTag } from 'react-icons/fi';

const Info = ({ movie }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Movie Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex items-start space-x-3">
          <FiClock className="w-6 h-6 text-red-500 mt-1" />
          <div>
            <h3 className="font-semibold mb-1 dark:text-white">Duration</h3>
            <p className="text-gray-600 dark:text-gray-300">{movie.duration}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <FiCalendar className="w-6 h-6 text-red-500 mt-1" />
          <div>
            <h3 className="font-semibold mb-1 dark:text-white">Release Date</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <FiTag className="w-6 h-6 text-red-500 mt-1" />
          <div>
            <h3 className="font-semibold mb-1 dark:text-white">Genre</h3>
            <p className="text-gray-600 dark:text-gray-300">{movie.category}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2 dark:text-white">Description</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {movie.description}
        </p>
      </div>
    </div>
  );
};

export default Info; 