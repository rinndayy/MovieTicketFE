import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import data from '../data/data.json'; // Import JSON trực tiếp
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Discount = () => {
  const [showAll, setShowAll] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef(null);

  const discounts = data?.discounts || []; // An toàn nếu không có dữ liệu

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };
  }, []);

  return (
    <div className="py-8 bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Special Offers</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Get amazing deals on combos
            </p>
          </div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-red-600 hover:text-red-700 font-semibold transition-colors"
          >
            {showAll ? 'Show Less' : 'See All'}
          </button>
        </div>

        <div className="relative">
          <div
            ref={scrollContainerRef}
            className={`${showAll ? '' : 'overflow-x-scroll scrollbar-hide'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <motion.div
              layout
              className={`flex ${showAll ? 'flex-wrap gap-6' : 'space-x-6'} pb-4`}
            >
              {discounts.length > 0 ? (
                discounts.map((discount) => (
                  <motion.div
                    layout
                    key={discount.id}
                    whileHover={{ scale: 1.05 }}
                    className={`flex-shrink-0 ${showAll ? 'w-[calc(33.333%-16px)]' : 'w-72'}`}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
                      <div className="relative h-48">
                        <img
                          src={discount.image}
                          alt={discount.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {discount.discount}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{discount.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                          {discount.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400 line-through">
                              ${discount.originalPrice.toFixed(2)}
                            </span>
                            <span className="text-lg font-bold text-red-500">
                              ${discount.discountedPrice.toFixed(2)}
                            </span>
                          </div>
                          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500">No discounts available</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discount;
