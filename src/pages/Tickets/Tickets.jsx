import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiMapPin, FiFilm, FiCalendar, FiArrowLeft, FiDollarSign } from 'react-icons/fi';
import moment from 'moment';
import 'moment/locale/vi';

const Ticket = ({ ticket }) => {
  const navigate = useNavigate();

  // Format date to 2024
  const date = moment(ticket.date);
  if (date.year() < 2024) {
    date.year(2024);
  }
  const formattedDate = date.format('DD/MM/YYYY');

  // Calculate number of seats
  const numberOfSeats = ticket.seats.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer"
      onClick={() => navigate(`/tickets/${ticket.id}`)}
    >
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-white">{ticket.movieTitle}</h3>

        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-gray-300">
            <FiMapPin className="w-4 h-4" />
            <div>
              <p>{ticket.cinema} - {ticket.hall}</p>
              <p className="text-sm text-gray-400">{ticket.cinemaLocation || "Địa chỉ rạp chiếu"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-gray-300">
            <FiCalendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center space-x-2 text-gray-300">
            <FiClock className="w-4 h-4" />
            <span>{ticket.time}</span>
          </div>

          <div className="flex items-center space-x-2 text-gray-300">
            <FiFilm className="w-4 h-4" />
            <div>
              <p>Seats: {ticket.seats.join(', ')}</p>
              <p className="text-sm text-gray-400">{numberOfSeats} {numberOfSeats > 1 ? 'seats' : 'seat'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-gray-300">
            <FiDollarSign className="w-4 h-4" />
            <div>
              <p>Price per seat: {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(ticket.totalAmount / numberOfSeats)}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Total Amount</span>
            <span className="font-bold text-red-500">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(ticket.totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const message = location.state?.message;

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Get tickets from localStorage
        const storedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');

        // Sort tickets by purchase date (newest first)
        const sortedTickets = storedTickets.sort((a, b) =>
          new Date(b.purchaseDate) - new Date(a.purchaseDate)
        );

        setTickets(sortedTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setError('Failed to load tickets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Back Button on its own row */}
        <div className="flex items-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="flex items-center text-white hover:text-red-500 transition-colors"
          >
            <FiArrowLeft className="w-6 h-6 mr-2" />
            <span>Back</span>
          </motion.button>
        </div>

        {/* Header on its own line */}
        <h1 className="text-3xl font-bold text-white mb-10">My Tickets</h1>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500 text-white p-4 rounded-lg mb-6"
          >
            {message}
          </motion.div>
        )}

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {tickets.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-xl mb-4">You don't have any tickets yet</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket) => (
              <Ticket key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;

