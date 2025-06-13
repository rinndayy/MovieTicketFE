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
    // Nếu phim từ database có poster hoặc image, trả về URL và _id gốc từ database
    if (movie.poster || movie.image) {
      console.log("Phim từ database có poster/image, _id:", movie._id, "URL:", (movie.poster || movie.image));
      return { 
        poster: movie.poster || movie.image, 
        _id: movie._id,
        bannerImage: movie.bannerImage || movie.banner || movie.image
      };
    }
    
    // Tìm phim trong data.json theo title
    const staticMovie = movieData.movies.find(m => m.title === movie.title);
    if (staticMovie) {
      // Nếu tìm thấy phim tĩnh, trả về poster từ data.json nhưng vẫn giữ _id từ database
      console.log("Phim từ database không có poster, lấy poster từ data.json, _id:", movie._id);
      return { 
        poster: staticMovie.poster || staticMovie.image, 
        _id: movie._id,
        bannerImage: staticMovie.bannerImage || staticMovie.banner || staticMovie.image
      };
    }
    
    console.log("Phim không tìm thấy poster ở cả database và data.json, _id:", movie._id);
    return { 
      poster: '/fallback-poster.jpg', 
      _id: movie._id,
      bannerImage: '/fallback-banner.jpg'
    };
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
        
        // Kết hợp phim từ database và data.json
        const combinedNowPlaying = [
          // Phim từ database
          ...dbNowPlaying.map(movie => {
            const { poster, _id, bannerImage } = getMoviePoster(movie);
            return { 
              ...movie, 
              poster, 
              _id,
              bannerImage,
              image: poster,
              id: _id,
              isFromDatabase: true // Đánh dấu phim từ database
            };
          }),
          // Phim tĩnh từ data.json (chỉ thêm những phim không trùng với database)
          ...staticNowPlaying
            .filter(staticMovie => !dbNowPlaying.some(dbMovie => dbMovie.title === staticMovie.title))
            .map(staticMovie => ({
              ...staticMovie,
              _id: `static_${staticMovie.id}`, // Tạo _id riêng cho phim tĩnh
              isFromDatabase: false // Đánh dấu phim từ data.json
            }))
        ];
        
        const combinedComingSoon = [
          // Phim từ database
          ...dbComingSoon.map(movie => {
            const { poster, _id, bannerImage } = getMoviePoster(movie);
            return { 
              ...movie, 
              poster, 
              _id,
              bannerImage,
              image: poster,
              id: _id,
              isFromDatabase: true // Đánh dấu phim từ database
            };
          }),
          // Phim tĩnh từ data.json (chỉ thêm những phim không trùng với database)
          ...staticComingSoon
            .filter(staticMovie => !dbComingSoon.some(dbMovie => dbMovie.title === staticMovie.title))
            .map(staticMovie => ({
              ...staticMovie,
              _id: `static_${staticMovie.id}`, // Tạo _id riêng cho phim tĩnh
              isFromDatabase: false // Đánh dấu phim từ data.json
            }))
        ];

        setNowPlayingMovies(combinedNowPlaying);
        setComingSoonMovies(combinedComingSoon);
        
        // Lấy 5 phim đang chiếu cho banner (ưu tiên phim từ database)
        const banner = [
          ...combinedNowPlaying.filter(movie => movie.isFromDatabase).slice(0, 3),
          ...combinedNowPlaying.filter(movie => !movie.isFromDatabase).slice(0, 2)
        ];
        setBannerMovies(banner);
        
      } catch (error) {
        console.error('Error fetching movies:', error);
        // Nếu có lỗi khi lấy dữ liệu từ database, sử dụng data.json
        setNowPlayingMovies(movieData.movies.filter(movie => movie.isNowPlaying).map(movie => ({
          ...movie,
          _id: `static_${movie.id}`,
          isFromDatabase: false
        })));
        setComingSoonMovies(movieData.movies.filter(movie => movie.isComingSoon).map(movie => ({
          ...movie,
          _id: `static_${movie.id}`,
          isFromDatabase: false
        })));
        setBannerMovies(movieData.bannerMovies.map(movie => ({
          ...movie,
          _id: `static_${movie.id}`,
          isFromDatabase: false
        })));
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