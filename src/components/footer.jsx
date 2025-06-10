import React from 'react';
import { motion } from 'framer-motion';
import { FiHome, FiFilm, FiUser } from 'react-icons/fi';
import { FaTicketAlt } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FaTicketAlt, label: 'Tickets', path: '/tickets' },
    { icon: FiFilm, label: 'Movies', path: '/movies' },
    { icon: FiUser, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative py-2 px-4"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative">
                    <Icon
                      className={`w-6 h-6 ${
                        isActive ? 'text-red-600' : 'text-gray-500'
                      }`}
                    />
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-1/2 w-1 h-1 bg-red-600 rounded-full"
                        initial={false}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 30,
                        }}
                        style={{ x: '-50%' }}
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      isActive
                        ? 'text-red-600 font-medium'
                        : 'text-gray-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Footer;