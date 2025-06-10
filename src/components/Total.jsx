import React from 'react';

const Total = ({ seats, onProceed }) => {
  const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);
  const seatCount = seats.length;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">
              Đã chọn: {seatCount} ghế
            </div>
            <div className="text-xl font-bold">
              Tổng tiền: {totalAmount.toLocaleString('vi-VN')} VNĐ
            </div>
          </div>
          <button
            onClick={onProceed}
            disabled={seatCount === 0}
            className={`
              px-6 py-3 rounded-lg text-white font-medium
              ${seatCount > 0
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
              }
            `}
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
};

export default Total; 