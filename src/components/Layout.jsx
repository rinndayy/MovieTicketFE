import React from 'react';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Top-left decoration */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-3xl" />
        
        {/* Bottom-right decoration */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
        
        {/* Center decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Layout; 