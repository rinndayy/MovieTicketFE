import React from 'react';
import { FiAlertCircle, FiGlobe } from 'react-icons/fi';

const Categories = ({ movie }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-start space-x-3">
          <FiAlertCircle className="w-6 h-6 text-red-500 mt-1" />
          <div>
            <h3 className="font-semibold mb-1 dark:text-white">Censorship</h3>
            <p className="text-gray-600 dark:text-gray-300">{movie.censorship}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <FiGlobe className="w-6 h-6 text-red-500 mt-1" />
          <div>
            <h3 className="font-semibold mb-1 dark:text-white">Language</h3>
            <p className="text-gray-600 dark:text-gray-300">{movie.language}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories; 