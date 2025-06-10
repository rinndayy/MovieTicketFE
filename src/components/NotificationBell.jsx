import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { movies } from '../data';

const NotificationItem = ({ notification, onClick }) => {
  const movie = movies.find(m => m.id === parseInt(notification.movieId));
  const imageUrl = movie?.banner || movie?.image || 'https://via.placeholder.com/160x200?text=No+Image';

  return (
    <motion.button
      whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
      onClick={() => onClick(notification)}
      className={`w-full p-4 text-left transition-colors ${
        !notification.read ? 'bg-red-50 dark:bg-red-900/10' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={imageUrl}
            alt={notification.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/160x200?text=No+Image';
            }}
          />
        </div>
        <div className="flex-1">
          <h4 className="font-medium dark:text-white">{notification.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {new Date(notification.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </motion.button>
  );
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Load notifications from localStorage
  const loadNotifications = () => {
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    setNotifications(stored);
    setUnreadCount(stored.filter(n => !n.read).length);
  };

  useEffect(() => {
    loadNotifications();
    window.addEventListener('storage', loadNotifications);
    return () => window.removeEventListener('storage', loadNotifications);
  }, []);

  const handleNotificationClick = (notification) => {
    const updated = notifications.map(n =>
      n.id === notification.id ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updated));
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);

    if (notification.type === 'ticket') {
      navigate(`/tickets/${notification.ticketId}`);
    }

    setShowNotifications(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500 transition-colors"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center"
          >
            <span className="text-xs text-white font-medium">{unreadCount}</span>
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
              onClick={() => setShowNotifications(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-96 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold dark:text-white">Notifications</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={handleNotificationClick}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
