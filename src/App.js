import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import './App.css';

// Pages
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Admin/Dashboard';
import MovieDetail from './pages/MovieDetail/MovieDetail';
import Select from './pages/Select/Select';
import Payment from './pages/Payment/Payment';
import Tickets from './pages/Tickets/Tickets';
import TicketDetail from './pages/Tickets/TicketDetail';
import { BookingPage, BookingSummary, BookingConfirmation } from './pages/Booking';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/movie/:id" element={<ProtectedRoute><MovieDetail /></ProtectedRoute>} />
            <Route path="/select/:id" element={<ProtectedRoute><Select /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/payment/:id" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
            <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
            
            {/* Booking Routes */}
            <Route path="/booking/:id" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
            <Route path="/booking/summary" element={<ProtectedRoute><BookingSummary /></ProtectedRoute>} />
            <Route path="/booking/confirmation" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/*" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
};

export default App;