import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCreditCard, FiSmartphone, FiDollarSign } from 'react-icons/fi';

const paymentMethods = [
  {
    id: 'credit_card',
    name: 'Credit Card',
    icon: FiCreditCard,
    description: 'Pay with Visa, Mastercard, or American Express'
  },
  {
    id: 'momo',
    name: 'MoMo',
    icon: FiSmartphone,
    description: 'Pay with MoMo e-wallet'
  },
  {
    id: 'cash',
    name: 'Cash',
    icon: FiDollarSign,
    description: 'Pay at the counter'
  }
];

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const { bookingData } = location.state || {};

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Invalid booking information</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Store ticket data in localStorage
      const ticketData = {
        id: Date.now().toString(),
        movieId: bookingData.movieId,
        movieTitle: bookingData.movieTitle,
        cinema: bookingData.cinema,
        hall: bookingData.hall,
        date: bookingData.date,
        time: bookingData.time,
        seats: bookingData.seats,
        totalAmount: bookingData.totalAmount,
        paymentMethod: selectedMethod,
        status: 'paid',
        purchaseDate: new Date().toISOString()
      };

      const existingTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      localStorage.setItem('tickets', JSON.stringify([...existingTickets, ticketData]));

      // Navigate to ticket detail page
      navigate(`/tickets/${ticketData.id}`, {
        state: { ticketData }
      });
    } catch (error) {
      setError('Payment processing failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white hover:text-red-500 transition-colors mb-4"
            >
              <FiArrowLeft className="w-6 h-6 mr-2" />
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-bold text-white">Payment</h1>
          </div>

          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Booking Summary</h2>
            <div className="space-y-3 text-gray-300">
              <p><span className="font-medium text-white">Movie:</span> {bookingData.movieTitle}</p>
              <p><span className="font-medium text-white">Cinema:</span> {bookingData.cinema}</p>
              <p><span className="font-medium text-white">Hall:</span> {bookingData.hall}</p>
              <p><span className="font-medium text-white">Date:</span> {bookingData.date}</p>
              <p><span className="font-medium text-white">Time:</span> {bookingData.time}</p>
              <p><span className="font-medium text-white">Seats:</span> {bookingData.seats.join(', ')}</p>
              <p className="text-lg font-semibold text-white">
                Total Amount: ${bookingData.totalAmount.toFixed(2)}
              </p>
            </div>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Select Payment Method</h2>
            <div className="grid gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex items-center p-4 rounded-lg transition-colors ${
                    selectedMethod === method.id
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <method.icon className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm opacity-75">{method.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-center mb-4"
            >
              {error}
            </motion.div>
          )}

          {/* Pay Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <button
              onClick={handlePayment}
              disabled={isProcessing || !selectedMethod}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors flex items-center ${
                isProcessing || !selectedMethod
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
