import React from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign } from 'react-icons/fi';

const Total = ({ selectedSeats, onProceed, hall }) => {
  const getSeatPrice = (seatId) => {
    if (!hall || !hall.seatMap) return 0;
    const row = seatId.charAt(0);
    const type = hall.seatMap.vipRows.includes(row) ? 'vip' : 'standard';
    return hall.seatMap.seatTypes[type].price;
  };

  const total = selectedSeats.reduce((sum, seatId) => sum + getSeatPrice(seatId), 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getSeatType = (seatId) => {
    if (!hall || !hall.seatMap) return 'standard';
    const row = seatId.charAt(0);
    return hall.seatMap.vipRows.includes(row) ? 'vip' : 'standard';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
    >
      <h2 className="text-xl font-bold mb-4 dark:text-white">Order Summary</h2>
      
      <div className="space-y-4 mb-6">
        {selectedSeats.map(seatId => (
          <motion.div
            key={seatId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex justify-between items-center"
          >
            <div className="flex items-center space-x-2">
              <FiDollarSign className={`w-5 h-5 ${getSeatType(seatId) === 'vip' ? 'text-yellow-500' : 'text-gray-500'}`} />
              <span className={`${getSeatType(seatId) === 'vip' ? 'text-yellow-500' : 'text-gray-500'} font-medium`}>
                Seat {seatId} ({getSeatType(seatId) === 'vip' ? 'VIP' : 'Standard'})
              </span>
            </div>
            <span className="font-medium dark:text-white">{formatPrice(getSeatPrice(seatId))}</span>
          </motion.div>
        ))}
      </div>

      {selectedSeats.length > 0 && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg dark:text-white">Total</span>
              <span className="font-bold text-lg text-red-600">{formatPrice(total)}</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: '#DC2626' }}
            whileTap={{ scale: 0.98 }}
            onClick={onProceed}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Proceed to Payment
          </motion.button>
        </>
      )}

      {selectedSeats.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 dark:text-gray-400"
        >
          Please select at least one seat to continue
        </motion.p>
      )}
    </motion.div>
  );
};

export default Total;
