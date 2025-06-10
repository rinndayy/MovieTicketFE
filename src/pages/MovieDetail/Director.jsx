import React from 'react';
import { FiVideo } from 'react-icons/fi';

const Director = ({ director }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <FiVideo className="w-6 h-6 text-red-500" />
        <h2 className="text-2xl font-bold dark:text-white">Director</h2>
      </div>
      
      <div className="flex items-start space-x-4">
        <img
          src={director.image}
          alt={director.name}
          className="w-24 h-24 rounded-lg object-cover"
        />
        <div>
          <h3 className="text-xl font-semibold mb-2 dark:text-white">{director.name}</h3>
          <p className="text-gray-600 dark:text-gray-300">{director.description}</p>
        </div>
      </div>
    </div>
  );
};

export default Director; 