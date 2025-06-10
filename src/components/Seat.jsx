import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Seat = ({ movieId, cinemaId, showtimeId }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatData, setSeatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();
  const MAX_SEATS = 8;

  useEffect(() => {
    const fetchSeatData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/seats/${movieId}`);
        if (response.data.success) {
          const cinema = response.data.data.find(c => c.id === cinemaId);
          if (cinema) {
            const showtime = cinema.showtimes.find(st => st.id === showtimeId);
            if (showtime) {
              setSeatData({
                cinema,
                showtime
              });
            } else {
              throw new Error('Không tìm thấy thông tin suất chiếu');
            }
          } else {
            throw new Error('Không tìm thấy thông tin rạp');
          }
        } else {
          throw new Error(response.data.message || 'Không thể tải thông tin ghế');
        }
      } catch (err) {
        setError(err.message || 'Không thể tải thông tin ghế. Vui lòng thử lại');
      } finally {
        setLoading(false);
      }
    };

    if (movieId && cinemaId && showtimeId) {
      fetchSeatData();
    }
  }, [movieId, cinemaId, showtimeId]);

  const handleSeatClick = async (seatId, seatType, price) => {
    const isSelected = selectedSeats.some(s => s.id === seatId);
    
    if (isSelected) {
      // Bỏ chọn ghế
      setSelectedSeats(prev => prev.filter(s => s.id !== seatId));
    } else {
      // Kiểm tra số lượng ghế tối đa
      if (selectedSeats.length >= MAX_SEATS) {
        alert(`Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế`);
        return;
      }
      // Thêm ghế mới
      setSelectedSeats(prev => [...prev, { id: seatId, type: seatType, price }]);
    }
  };

  useEffect(() => {
    const newTotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    setTotalPrice(newTotal);
  }, [selectedSeats]);

  if (loading) {
    return <div className="text-center py-8">Đang tải thông tin ghế...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (!seatData) {
    return <div className="text-center py-8">Không tìm thấy thông tin ghế</div>;
  }

  const { cinema, showtime } = seatData;

  // Tạo mảng tất cả các ghế từ thông tin showtime
  const getAllSeats = () => {
    const allSeats = [];
    
    // Thêm ghế thường
    showtime.seats.standard.rows.forEach(row => {
      const availableSeats = showtime.seats.standard.available
        .filter(seat => seat.startsWith(row))
        .map(seat => ({
          id: seat,
          row: seat[0],
          number: parseInt(seat.slice(1)),
          type: 'standard',
          price: showtime.seats.standard.price,
          status: 'available'
        }));

      const occupiedSeats = showtime.seats.standard.occupied
        .filter(seat => seat.startsWith(row))
        .map(seat => ({
          id: seat,
          row: seat[0],
          number: parseInt(seat.slice(1)),
          type: 'standard',
          price: showtime.seats.standard.price,
          status: 'occupied'
        }));

      allSeats.push(...availableSeats, ...occupiedSeats);
    });

    // Thêm ghế VIP
    showtime.seats.vip.rows.forEach(row => {
      const availableSeats = showtime.seats.vip.available
        .filter(seat => seat.startsWith(row))
        .map(seat => ({
          id: seat,
          row: seat[0],
          number: parseInt(seat.slice(1)),
          type: 'vip',
          price: showtime.seats.vip.price,
          status: 'available'
        }));

      const occupiedSeats = showtime.seats.vip.occupied
        .filter(seat => seat.startsWith(row))
        .map(seat => ({
          id: seat,
          row: seat[0],
          number: parseInt(seat.slice(1)),
          type: 'vip',
          price: showtime.seats.vip.price,
          status: 'occupied'
        }));

      allSeats.push(...availableSeats, ...occupiedSeats);
    });

    return allSeats.sort((a, b) => {
      if (a.row !== b.row) return a.row.localeCompare(b.row);
      return a.number - b.number;
    });
  };

  const seats = getAllSeats();
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Sơ đồ ghế - {cinema.name}</h2>
        <div className="flex gap-4 mb-4">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-400 mr-2"></div>
            <span>Ghế đã đặt</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-blue-500 mr-2"></div>
            <span>Ghế đang chọn</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-yellow-500 mr-2"></div>
            <span>Ghế VIP</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-200 mr-2"></div>
            <span>Ghế thường</span>
          </div>
        </div>
      </div>

      <div className="screen mb-8 bg-gray-300 p-4 text-center rounded">
        Màn hình
      </div>

      <div className="seats-container">
        {Object.entries(seatsByRow).map(([row, seats]) => (
          <div key={row} className="flex justify-center gap-2 mb-2">
            <div className="w-8 flex items-center justify-center font-bold">
              {row}
            </div>
            {seats.map((seat) => {
              const isSelected = selectedSeats.some(s => s.id === seat.id);
              const isOccupied = seat.status === 'occupied';
              const isVIP = seat.type === 'vip';

              return (
                <button
                  key={seat.id}
                  className={`
                    w-8 h-8 rounded
                    ${isOccupied ? 'bg-gray-400 cursor-not-allowed' : ''}
                    ${!isOccupied && !isSelected && isVIP ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                    ${!isOccupied && !isSelected && !isVIP ? 'bg-gray-200 hover:bg-gray-300' : ''}
                    ${isSelected ? 'bg-blue-500 hover:bg-blue-600' : ''}
                  `}
                  onClick={() => !isOccupied && handleSeatClick(seat.id, seat.type, seat.price)}
                  disabled={isOccupied}
                >
                  {seat.number}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2">Ghế đã chọn:</h3>
        <div className="flex flex-wrap gap-2">
          {selectedSeats.map((seat) => (
            <span
              key={seat.id}
              className="px-3 py-1 bg-blue-100 rounded"
            >
              {seat.id} ({seat.type === 'vip' ? 'VIP' : 'Thường'})
            </span>
          ))}
        </div>
        <p className="mt-4 text-xl">
          Tổng tiền: {totalPrice.toLocaleString('vi-VN')} VNĐ
        </p>
      </div>
    </div>
  );
};

export default Seat; 