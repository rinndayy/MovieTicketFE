import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCreditCard } from 'react-icons/fi';
import axios from 'axios';

const paymentMethods = [
  {
    id: 'momo',
    name: 'MoMo',
    logo: '/images/payment/momo.png'
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    logo: '/images/payment/zalopay.png'
  },
  {
    id: 'vnpay',
    name: 'VNPay',
    logo: '/images/payment/vnpay.png'
  }
];

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`/api/bookings/${bookingId}`);
        setBooking(response.data);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handlePayment = async () => {
    if (!selectedMethod) {
      return;
    }

    setIsProcessing(true);
    try {
      // Update booking with payment method
      await axios.put(`/api/bookings/${bookingId}/payment`, {
        paymentMethod: selectedMethod,
        status: 'completed'
      });

      // Navigate to success page
      navigate(`/booking-success/${bookingId}`);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Booking not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center text-white hover:text-red-500 transition-colors"
          >
            <FiArrowLeft className="w-6 h-6 mr-2" />
            <span>Back</span>
          </motion.button>
          <h1 className="text-3xl font-bold text-white ml-8">Payment</h1>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Select Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentMethods.map(method => (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedMethod === method.id
                        ? 'border-red-500 bg-gray-700'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={method.logo}
                      alt={method.name}
                      className="w-full h-12 object-contain mb-2"
                    />
                    <p className="text-white text-center">{method.name}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-800 rounded-lg p-6 h-fit">
            <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-gray-300">
                <span>Tickets ({booking.seats.length})</span>
                <span>{booking.totalAmount.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Service Fee</span>
                <span>0đ</span>
              </div>
              <div className="border-t border-gray-600 pt-4">
                <div className="flex justify-between text-white font-semibold">
                  <span>Total</span>
                  <span>{booking.totalAmount.toLocaleString()}đ</span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!selectedMethod || isProcessing}
              onClick={handlePayment}
              className={`w-full mt-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 ${
                selectedMethod && !isProcessing
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
            >
              <FiCreditCard className="w-5 h-5" />
              <span>
                {isProcessing ? 'Processing...' : 'Pay Now'}
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment; 