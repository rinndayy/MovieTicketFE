import React from 'react';
import { motion } from 'framer-motion';

const Categories = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-lg mb-8"
    >
      <div className="flex flex-wrap gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all
            ${selectedCategory === 'all'
              ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
              : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
            }`}
        >
          All Movies
        </motion.button>

        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all
              ${selectedCategory === category
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
              }`}
          >
            {category}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default Categories;