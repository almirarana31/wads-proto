import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SubmitTicketPage from './pages/SubmitTicketPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ViewTicketsPage from './pages/ViewTicketsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Footer from './components/Footer';
import './App.css';

function App() {
  // In a real app, you would check authentication status from your backend/local storage
  const isAuthenticated = false; // Set to true to test authenticated routes

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  return (
    <Router>
      <div className="app">
        <Header isAuthenticated={isAuthenticated} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/submit-ticket" element={<SubmitTicketPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route 
              path="/view-tickets" 
              element={
                <ProtectedRoute>
                  <ViewTicketsPage />
                </ProtectedRoute>
              } 
            />
            {/* Add more protected routes as needed */}
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;