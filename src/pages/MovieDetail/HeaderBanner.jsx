import React from 'react';
import { FiStar, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const HeaderBanner = ({ movie }) => {
  const navigate = useNavigate();

  return (
    <div className="relative h-[70vh] w-full">
      {/* Banner Image */}
      <img
        src={movie.bannerImage || movie.image || 'https://via.placeholder.com/1200x600?text=No+Image'}
        alt={movie.title}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/1200x600?text=No+Image';
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-10 flex items-center space-x-2 text-white hover:text-red-500 transition-colors"
      >
        <FiArrowLeft className="w-6 h-6" />
        <span className="text-lg">Back</span>
      </button>

      {/* Movie Info */}
      <div className="absolute bottom-0 left-0 w-full p-8">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {movie.title}
          </h1>
          <div className="flex items-center space-x-6 text-white mb-6">
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
          </div>
          <button 
            onClick={() => navigate(`/select/${movie.id}`)}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Book Tickets
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderBanner; 