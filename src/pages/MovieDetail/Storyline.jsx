import React from 'react';
import { FiBookOpen } from 'react-icons/fi';

const Storyline = ({ movie }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <FiBookOpen className="w-6 h-6 text-red-500" />
        <h2 className="text-2xl font-bold dark:text-white">Storyline</h2>
      </div>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        {movie.storyline}
      </p>
    </div>
  );
};

export default Storyline; 