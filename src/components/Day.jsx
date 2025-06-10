import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, addDays, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';

const Day = ({ movieId, cinemaId, onDateSelect, selectedDate }) => {
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/seats/${movieId}`);
        if (response.data.success) {
          const cinema = response.data.data.find(c => c.id === cinemaId);
          if (cinema) {
            // Lấy tất cả các ngày có suất chiếu
            const dates = cinema.showtimes.map(st => st.date);
            // Loại bỏ các ngày trùng lặp và sắp xếp
            const uniqueDates = [...new Set(dates)].sort();
            setAvailableDates(uniqueDates);
          }
        }
      } catch (err) {
        setError('Không thể tải thông tin ngày chiếu');
      } finally {
        setLoading(false);
      }
    };

    if (movieId && cinemaId) {
      fetchAvailableDates();
    }
  }, [movieId, cinemaId]);

  // Tạo danh sách 7 ngày từ hôm nay
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      date,
      dayName: format(date, 'EEE', { locale: vi }),
      dayMonth: format(date, 'd/M'),
      isoDate: format(date, 'yyyy-MM-dd')
    };
  });

  if (loading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Ngày chiếu
      </label>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {next7Days.map(({ date, dayName, dayMonth, isoDate }) => {
          const isAvailable = availableDates.includes(isoDate);
          const isSelected = selectedDate === isoDate;

          return (
            <button
              key={isoDate}
              onClick={() => isAvailable && onDateSelect(isoDate)}
              disabled={!isAvailable}
              className={`
                min-w-[100px] p-3 rounded-lg text-center
                ${isAvailable
                  ? isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-white hover:bg-gray-100'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
                border ${isSelected ? 'border-blue-600' : 'border-gray-200'}
              `}
            >
              <div className="text-sm font-medium">{dayName}</div>
              <div className="text-lg">{dayMonth}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Day; 