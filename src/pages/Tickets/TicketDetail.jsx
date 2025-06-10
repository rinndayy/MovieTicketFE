import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock, FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import movieData from '../data/data.json';
import moment from 'moment';
import 'moment/locale/vi';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    const foundTicket = tickets.find(t => t.id === id);
    if (foundTicket) {
      setTicket(foundTicket);
      const foundMovie = movieData.movies.find(m => m.id.toString() === foundTicket.movieId.toString());
      setMovie(foundMovie);
    }
  }, [id]);

  if (!ticket || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Ticket not found</p>
      </div>
    );
  }

  // Format ticket data for QR code
  const qrData = JSON.stringify({
    id: ticket.id,
    movie: ticket.movieTitle,
    cinema: ticket.cinema,
    hall: ticket.hall,
    date: moment(ticket.date).format('DD/MM/YYYY'),
    time: ticket.time,
    seats: ticket.seats.join(', '),
    totalAmount: ticket.totalAmount
  });

  // Format date
  const formattedDate = moment(ticket.date).format('dddd, DD/MM/YYYY');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-red-600 p-6 text-white">
        <h3 className="text-2xl font-bold">{ticket.movieTitle}</h3>
        <p className="text-red-100 mt-2">{ticket.id}</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Cinema Info */}
        <div className="flex items-start space-x-4">
          <FiMapPin className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold dark:text-white">{ticket.cinema}</p>
            <p className="text-gray-600 dark:text-gray-300">{ticket.hall}</p>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex items-start space-x-4">
          <FiClock className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold dark:text-white">{formattedDate}</p>
            <p className="text-gray-600 dark:text-gray-300">{ticket.time}</p>
          </div>
        </div>

        {/* Seats */}
        <div className="flex items-start space-x-4">
          <FiUsers className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold dark:text-white">Ghế</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {ticket.seats.map(seat => (
                <span
                  key={seat}
                  className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm"
                >
                  {seat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold dark:text-white">Tổng tiền</span>
            <span className="text-lg font-bold text-red-600">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(ticket.totalAmount)}
            </span>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <QRCodeSVG
            value={qrData}
            size={200}
            level="H"
            includeMargin={true}
            className="bg-white p-2 rounded"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Quét mã QR để xem thông tin vé
          </p>
        </div>

        {/* Print Button */}
        <button
          onClick={() => window.print()}
          className="w-full mt-6 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          In vé
        </button>
      </div>
    </motion.div>
  );
};

export default TicketDetail;
