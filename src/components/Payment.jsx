// ... existing code ...

const handleConfirmPayment = async () => {
  try {
    setLoading(true);
    
    // Create new ticket object
    const newTicket = {
      _id: Date.now().toString(), // Generate a unique ID
      movieId: selectedMovie.id,
      movieTitle: selectedMovie.title,
      cinema: selectedCinema,
      hall: selectedHall,
      date: selectedDate,
      time: selectedTime,
      seats: selectedSeats,
      totalAmount: totalAmount,
      paymentMethod: 'cash',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // Get existing tickets from localStorage
    const existingTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
    
    // Add new ticket
    const updatedTickets = [...existingTickets, newTicket];
    
    // Save to localStorage
    localStorage.setItem('userTickets', JSON.stringify(updatedTickets));
    
    // Save selected ticket for immediate viewing
    localStorage.setItem('selectedTicket', JSON.stringify(newTicket));

    setLoading(false);
    
    // Navigate to ticket detail page
    navigate(`/tickets/${newTicket._id}`);
  } catch (error) {
    setLoading(false);
    setError('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.');
  }
};

// ... existing code ...