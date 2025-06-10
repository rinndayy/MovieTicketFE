import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import HeaderBanner from './HeaderBanner';
import Info from './Info';
import Categories from './Categories';
import Storyline from './Storyline';
import Director from './Director';
import Actor from './Actor';
import Cinema from './Cinema';
import Comments from './Comments';
import Footer from '../../components/footer';
import { movies } from '../../data';

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const movie = movies.find(m => m.id === id || m.id === parseInt(id));

  useEffect(() => {
    window.scrollTo(0, 0);
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"
      >
        <div className="flex flex-col items-center space-y-4">
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
          <p className="text-gray-600 dark:text-gray-300">Loading movie details...</p>
        </div>
      </motion.div>
    );
  }

  if (!movie) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Movie Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gray-50 dark:bg-gray-900"
      >
        <HeaderBanner movie={movie} />
        
        <main className="relative -mt-16 z-10">
          <div className="container mx-auto px-4 space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Info movie={movie} />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Categories movie={movie} />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Storyline movie={movie} />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Director director={movie.director} />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Actor actors={movie.actors} />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Cinema cinemas={movie.cinemas} />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Comments movieId={movie.id} />
            </motion.div>
          </div>
        </main>

        <Footer />
      </motion.div>
    </AnimatePresence>
  );
};

export default Detail; 