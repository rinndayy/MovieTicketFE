import React from 'react';
import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur p-8 rounded-2xl flex flex-col items-center"
      >
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white text-lg font-medium"
        >
          Loading...
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Loading;
