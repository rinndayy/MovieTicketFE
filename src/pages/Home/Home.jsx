import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Banner from './Banner';
import Header from './Header';
import NowPlaying from './NowPlaying';
import Soon from './Soon';
import Discount from './Discount';
import Footer from '../../components/footer';
import { getAllMovies } from '../../services/movieService';
import { toast } from 'react-toastify';
import movieData from '../data/data.json';

const Home = () => {
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [bannerMovies, setBannerMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm lấy poster từ data.json nếu phim từ database không có, đồng thời giữ _id từ database
  const getMoviePoster = (movie) => {
    // Nếu phim từ database có poster, trả về poster và _id gốc từ database
    if (movie.poster) {
      console.log("Phim từ database có poster, _id:", movie._id, "poster:", movie.poster);
      return { poster: movie.poster, _id: movie._id };
    }
    // Tìm phim trong data.json theo title
    const staticMovie = movieData.movies.find(m => m.title === movie.title);
    if (staticMovie) {
      // Nếu tìm thấy phim tĩnh, trả về poster từ data.json nhưng vẫn giữ _id từ database
      console.log("Phim từ database không có poster, lấy poster từ data.json, _id:", movie._id, "poster từ data:", (staticMovie.poster || staticMovie.image));
      return { poster: (staticMovie.poster || staticMovie.image), _id: movie._id };
    }
    console.log("Phim không tìm thấy poster ở cả database và data.json, _id:", movie._id);
    return { poster: '', _id: movie._id };
  };

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        // Lấy phim từ database
        const dbMovies = await getAllMovies();
        console.log("Danh sách phim từ database (MongoDB):", dbMovies);
        
        // Lấy phim tĩnh từ data.json
        const staticNowPlaying = movieData.movies.filter(movie => movie.isNowPlaying);
        const staticComingSoon = movieData.movies.filter(movie => movie.isComingSoon);
        
        // Lọc phim từ database theo status
        const dbNowPlaying = dbMovies.filter(movie => movie.status === 'now-playing');
        const dbComingSoon = dbMovies.filter(movie => movie.status === 'coming-soon');
        console.log("Phim đang chiếu từ database (dbNowPlaying):", dbNowPlaying);
        console.log("Phim sắp chiếu từ database (dbComingSoon):", dbComingSoon);
        
        // Kết hợp phim từ database và data.json
        // Nếu phim có cùng title, ưu tiên dùng phim từ database nhưng giữ poster từ data.json nếu cần
        const combinedNowPlaying = [
          ...dbNowPlaying.map(movie => {
            const { poster, _id } = getMoviePoster(movie);
            // Đảm bảo _id luôn là _id từ database (MongoDB)
            const combinedMovie = { ...movie, poster, _id };
            console.log("Kết hợp phim đang chiếu (combined):", combinedMovie);
            return combinedMovie;
          }),
          ...staticNowPlaying.filter(staticMovie => 
            !dbNowPlaying.some(dbMovie => dbMovie.title === staticMovie.title)
          )
        ];
        
        const combinedComingSoon = [
          ...dbComingSoon.map(movie => {
            const { poster, _id } = getMoviePoster(movie);
            // Đảm bảo _id luôn là _id từ database (MongoDB)
            const combinedMovie = { ...movie, poster, _id };
            console.log("Kết hợp phim sắp chiếu (combined):", combinedMovie);
            return combinedMovie;
          }),
          ...staticComingSoon.filter(staticMovie => 
            !dbComingSoon.some(dbMovie => dbMovie.title === staticMovie.title)
          )
        ];

        setNowPlayingMovies(combinedNowPlaying);
        setComingSoonMovies(combinedComingSoon);
        
        // Lấy 5 phim đang chiếu cho banner (ưu tiên phim từ database)
        const banner = combinedNowPlaying.slice(0, 5);
        setBannerMovies(banner);
        
      } catch (error) {
        console.error('Error fetching movies:', error);
        // Nếu có lỗi khi lấy dữ liệu từ database, sử dụng data.json
        setNowPlayingMovies(movieData.movies.filter(movie => movie.isNowPlaying));
        setComingSoonMovies(movieData.movies.filter(movie => movie.isComingSoon));
        setBannerMovies(movieData.bannerMovies);
        toast.error('Failed to load movies from database, using local data');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

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
      className="relative min-h-screen bg-gradient-to-b from-[#0f2027] via-[#203a43] to-[#2c5364]"
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
          <Banner movies={bannerMovies} />
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