import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock, FiMapPin, FiCalendar, FiUsers, FiFilm, FiDollarSign } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import movieData from '../data/data.json';
import moment from 'moment';
import 'moment/locale/vi';

// Add print-specific styles
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .print-section, .print-section * {
      visibility: visible;
    }
    .print-section {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .no-print {
      display: none !important;
    }
    .print-section {
      background-color: white !important;
      color: black !important;
    }
    .print-section .text-gray-400 {
      color: #4B5563 !important;
    }
    .print-section .text-white {
      color: black !important;
    }
    .print-section .bg-gray-800 {
      background-color: white !important;
    }
  }
`;

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [movie, setMovie] = useState(null);
  const [cinema, setCinema] = useState(null);
  const [hall, setHall] = useState(null);

  useEffect(() => {
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    const foundTicket = tickets.find(t => t.id === id);
    if (foundTicket) {
      setTicket(foundTicket);
      
      // Find movie details
      const foundMovie = movieData.movies.find(m => m.id.toString() === foundTicket.movieId.toString());
      if (foundMovie) {
        setMovie(foundMovie);
        
        // Find cinema and hall details
        const foundCinema = foundMovie.cinemas.find(c => c.id === foundTicket.cinema);
        if (foundCinema) {
          setCinema(foundCinema);
          const foundHall = foundCinema.halls.find(h => h.id === foundTicket.hall);
          if (foundHall) {
            setHall(foundHall);
          }
        }
      }
    }
  }, [id]);

  if (!ticket || !movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-xl mb-4">Ticket not found</p>
          <button
            onClick={() => navigate('/tickets')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to My Tickets
          </button>
        </div>
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

  // Format date without day of week and year
  const formattedDate = moment(ticket?.date).format('DD/MM');

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <style>{printStyles}</style>
      <div className="container mx-auto px-4">
        {/* Back Button - No Print */}
        <motion.button
          className="flex items-center text-white hover:text-red-500 transition-colors mb-8 no-print"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/tickets')}
        >
          <FiArrowLeft className="w-6 h-6 mr-2" />
          <span>Back</span>
        </motion.button>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-gray-800 rounded-lg shadow-xl overflow-hidden print-section"
          >
            {/* Movie Banner */}
            <div 
              className="w-full h-48 bg-cover bg-center relative"
              style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(17,24,39,1)), url(${movie.bannerImage || movie.image})` }}
            >
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-3xl font-bold text-white mb-2">{movie.title}</h1>
                <div className="flex items-center space-x-4 text-gray-300">
                  <span>{movie.duration}</span>
                  <span>•</span>
                  <span>{movie.category}</span>
                </div>
              </div>
            </div>

            {/* Ticket Content */}
            <div className="p-6 space-y-6">
              {/* Cinema Info */}
              <div className="flex items-start space-x-4">
                <FiMapPin className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">{cinema?.name}</p>
                  <p className="text-gray-400">{cinema?.address || "Tầng 4, Vincom Mega Mall Smart City, Đại lộ Thăng Long, Tây Mỗ, Nam Từ Liêm, Hà Nội"}</p>
                  <p className="text-gray-400 mt-1">
                    {hall?.name} {hall?.type}
                  </p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-start space-x-4">
                <FiClock className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">{formattedDate}</p>
                  <p className="text-gray-400">{ticket.time}</p>
                </div>
              </div>

              {/* Seats */}
              <div className="flex items-start space-x-4">
                <FiUsers className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white mb-2">Selected Seats</p>
                  <div className="flex flex-wrap gap-2">
                    {ticket.seats.map(seat => {
                      const isVipSeat = hall?.seatMap.vipRows.includes(seat[0]);
                      return (
                        <span
                          key={seat}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            isVipSeat
                              ? 'bg-yellow-500 text-yellow-900'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {seat}
                          <span className="ml-1 text-xs">
                            ({isVipSeat ? 'VIP' : 'Standard'})
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Price Details */}
              <div className="border-t border-gray-700 pt-4">
                <div className="space-y-4">
                  {/* Standard Seats */}
                  {(() => {
                    const standardSeatsCount = ticket.seats.filter(seat => !hall?.seatMap.vipRows.includes(seat[0])).length;
                    if (standardSeatsCount > 0) {
                      return (
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-gray-400">Standard Seats</span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({standardSeatsCount} seats)
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-white">{new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(standardSeatsCount * (hall?.seatMap.seatTypes.standard.price || 75000))}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* VIP Seats */}
                  {(() => {
                    const vipSeatsCount = ticket.seats.filter(seat => hall?.seatMap.vipRows.includes(seat[0])).length;
                    if (vipSeatsCount > 0) {
                      return (
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-gray-400">VIP Seats</span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({vipSeatsCount} seats)
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-white">{new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(vipSeatsCount * (hall?.seatMap.seatTypes.vip.price || 90000))}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Total Amount */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                    <span className="font-semibold text-white">Total Amount</span>
                    <span className="text-lg font-bold text-red-500">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(ticket.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center space-y-4 pt-6 border-t border-gray-700">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG
                    value={qrData}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-gray-400 text-sm">
                  Scan QR code to verify ticket
                </p>
              </div>

              {/* Print Button - No Print */}
              <div className="flex space-x-4 pt-6 border-t border-gray-700 no-print">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FiFilm className="w-5 h-5 mr-2" />
                  Print Ticket
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
