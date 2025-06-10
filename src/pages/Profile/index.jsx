import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiEdit2, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, logout, updateProfile, getToken } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch('http://localhost:5000/api/bookings/user', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not fetch bookings');
        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'bookings') fetchBookings();
  }, [activeTab, getToken]);

  const handleSaveProfile = async () => {
    try {
      setError(null);
      const token = getToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile');
      updateProfile(data.user);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <FiUser className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.fullName}</h1>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-red-500"
            >
              <FiLogOut /> <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'profile'
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'bookings'
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            Booking History
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Details</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 text-red-600 hover:text-red-500"
              >
                <FiEdit2 /> <span>{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            <div className="space-y-6">
              {['fullName', 'email', 'phone'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {field === 'fullName' ? 'Full Name' : field === 'email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    disabled={!isEditing}
                    className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                </div>
              ))}
              {isEditing && (
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Booking History</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bookings found.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-bold text-lg mb-2 dark:text-white">{booking.movie.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Date:</span>{' '}
                      {new Date(booking.showtime.datetime).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Time:</span>{' '}
                      {new Date(booking.showtime.datetime).toLocaleTimeString()}
                    </p>
                    <div className="mt-2">
                      <span className="font-medium">Seats:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {booking.seats.map((seat) => (
                          <span
                            key={seat._id}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm dark:text-gray-300"
                          >
                            {seat.row}
                            {seat.seatNumber}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Profile;