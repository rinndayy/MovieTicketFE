import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react'; // ✅ Sửa đúng import

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking } = location.state || {};

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Booking not found</h2>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Thank you for your booking</p>
        </div>

        <div className="mb-8 flex justify-center">
          <QRCodeCanvas 
            value={`http://localhost:3000/tickets/${booking._id}`}
            size={200}
            level="H"
          />
        </div>

        <div className="space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
            <p><span className="font-medium">Booking ID:</span> {booking._id}</p>
            <p><span className="font-medium">Movie:</span> {booking.movie.title}</p>
            <p><span className="font-medium">Date:</span> {new Date(booking.showtime.datetime).toLocaleDateString()}</p>
            <p><span className="font-medium">Time:</span> {new Date(booking.showtime.datetime).toLocaleTimeString()}</p>
          </div>

          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Seats</h2>
            <div className="flex flex-wrap gap-2">
              {booking.seats.map((seat) => (
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
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <p><span className="font-medium">Total Amount:</span> ${booking.totalAmount}</p>
            <p><span className="font-medium">Payment Method:</span> {booking.paymentMethod}</p>
            <p>
              <span className="font-medium">Payment Status:</span>
              <span className="ml-2 px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">
                Paid
              </span>
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => navigate('/tickets')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            View My Tickets
          </button>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
