import React from 'react';
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

  return (
    <div>
      <Header />
      <Banner movies={movieData.bannerMovies} />
      <NowPlaying movies={nowPlayingMovies} />
      <Soon movies={comingSoonMovies} />
      <Discount />
      <Footer />
    </div>
  );
};

export default Home; 