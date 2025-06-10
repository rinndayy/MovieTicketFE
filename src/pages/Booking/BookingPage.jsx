import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BookingPage = () => {
  const { id } = useParams(); // movie id
  const navigate = useNavigate();
  const {  getToken } = useAuth();
  const [movie, setMovie] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/movies/${id}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Could not fetch movie details');
        }
        
        setMovie(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id, getToken]);

  const handleShowtimeSelect = (showtime) => {
    setSelectedShowtime(showtime);
  };

  const handleContinue = () => {
    if (!selectedShowtime) {
      alert('Please select a showtime first');
      return;
    }
    navigate(`/select/${id}?showtime=${selectedShowtime._id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Movie not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{movie.title}</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Movie Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <img 
                src={movie.poster} 
                alt={movie.title} 
                className="w-full rounded-lg"
              />
            </div>
            <div>
              <p className="mb-2"><span className="font-semibold">Duration:</span> {movie.duration} minutes</p>
              <p className="mb-2"><span className="font-semibold">Genre:</span> {movie.genre}</p>
              <p className="mb-2"><span className="font-semibold">Release Date:</span> {new Date(movie.releaseDate).toLocaleDateString()}</p>
              <p className="mb-4"><span className="font-semibold">Description:</span> {movie.description}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Showtime</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {movie.showtimes?.map((showtime) => (
              <button
                key={showtime._id}
                onClick={() => handleShowtimeSelect(showtime)}
                className={`p-4 rounded-lg text-center transition-colors ${
                  selectedShowtime?._id === showtime._id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <p className="font-semibold">{new Date(showtime.datetime).toLocaleDateString()}</p>
                <p>{new Date(showtime.datetime).toLocaleTimeString()}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            disabled={!selectedShowtime}
            className={`px-6 py-2 rounded-lg ${
              selectedShowtime
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Continue to Seat Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage; 