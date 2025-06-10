import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BookingSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, showtime, selectedSeats, totalAmount } = location.state || {};

  if (!movie || !showtime || !selectedSeats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Invalid booking information</h2>
          <button
            onClick={() => navigate('/home')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const handleProceedToPayment = () => {
    navigate('/payment', {
      state: {
        movie,
        showtime,
        selectedSeats,
        totalAmount
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6">Booking Summary</h1>

        <div className="space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Movie Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  className="w-full rounded-lg"
                />
              </div>
              <div>
                <p className="font-bold text-xl mb-2">{movie.title}</p>
                <p className="mb-2"><span className="font-medium">Duration:</span> {movie.duration} minutes</p>
                <p className="mb-2"><span className="font-medium">Genre:</span> {movie.genre}</p>
              </div>
            </div>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Showtime Details</h2>
            <p><span className="font-medium">Date:</span> {new Date(showtime.datetime).toLocaleDateString()}</p>
            <p><span className="font-medium">Time:</span> {new Date(showtime.datetime).toLocaleTimeString()}</p>
            <p><span className="font-medium">Screen:</span> {showtime.screen}</p>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Selected Seats</h2>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((seat) => (
                <span 
                  key={seat._id}
                  className="px-3 py-1 bg-gray-100 rounded-full"
                >
                  {seat.row}{seat.number}
                </span>
              ))}
            </div>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Price Summary</h2>
            <div className="space-y-2">
              {selectedSeats.map((seat) => (
                <div key={seat._id} className="flex justify-between">
                  <span>Seat {seat.row}{seat.number} ({seat.type})</span>
                  <span>${seat.price}</span>
                </div>
              ))}
              <div className="border-t pt-2 font-bold flex justify-between">
                <span>Total Amount</span>
                <span>${totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4 justify-end">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Back
          </button>
          <button
            onClick={handleProceedToPayment}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary; 