import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiMapPin, FiFilm } from 'react-icons/fi';
import moment from 'moment';
import 'moment/locale/vi';
import axiosInstance from '../../utils/axios';

const Ticket = ({ ticket }) => {
  const navigate = useNavigate();
  
  // Format date to 2024
  const date = moment(ticket.date);
  if (date.year() < 2024) {
    date.year(2024);
  }
  const formattedDate = date.format('DD/MM/YYYY');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer"
      onClick={() => navigate(`/tickets/${ticket._id}`)}
    >
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 dark:text-white">{ticket.movieTitle}</h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <FiMapPin className="w-4 h-4" />
            <span>{ticket.cinema}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <FiClock className="w-4 h-4" />
            <span>{formattedDate} - {ticket.time}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <FiFilm className="w-4 h-4" />
            <span>Ghế: {ticket.seats.join(', ')}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Tổng tiền</span>
            <span className="font-bold text-red-600">
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

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axiosInstance.get('/api/tickets');
        // Adjust dates to 2024
        const adjustedTickets = response.data.tickets.map(ticket => {
          const date = moment(ticket.date);
          if (date.year() < 2024) {
            date.year(2024);
          }
          return {
            ...ticket,
            date: date.toISOString()
          };
        });
        setTickets(adjustedTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setError('Không thể tải danh sách vé. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8 dark:text-white">Vé của tôi</h1>
        
        {tickets.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p>Bạn chưa có vé nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map(ticket => (
              <Ticket key={ticket._id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;