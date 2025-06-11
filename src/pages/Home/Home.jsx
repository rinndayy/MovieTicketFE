import React from 'react';
import { motion } from 'framer-motion';
import Banner from './Banner';
import Header from './Header';
import NowPlaying from './NowPlaying';
import Soon from './Soon';
import Discount from './Discount';
import Footer from '../../components/footer';
import movieData from '../data/data.json';

const Home = () => {
  const nowPlayingMovies = movieData.movies.filter(movie => movie.isNowPlaying);
  const comingSoonMovies = movieData.movies.filter(movie => movie.isComingSoon);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen relative"
    >
      {/* Background gradient with decorative elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-red-50">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-100/50 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-100/30 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <motion.div variants={itemVariants}>
          <Header />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Banner movies={movieData.bannerMovies} />
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="relative z-10 -mt-10 bg-gradient-to-b from-transparent via-white/80 to-white pt-20"
        >
          <NowPlaying movies={nowPlayingMovies} />
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-white/90"
        >
          <Soon movies={comingSoonMovies} />
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-white/90"
        >
          <Discount />
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="relative z-10"
        >
          <Footer />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home; 