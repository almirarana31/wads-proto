import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SubmitTicketPage from './pages/SubmitTicketPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ViewTicketsPage from './pages/ViewTicketsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordVerifyPage from './pages/ResetPasswordVerifyPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Footer from './components/Footer';
import TicketDetailsPage from './pages/TicketDetailsPage';
import Logout from './components/Logout';
import AdminDashboard from './pages/AdminDashPage';
import Chatroom from './pages/Chatroom'; // Import the Chatroom component
import AuditLogPage from './pages/AuditLogPage';

function App() {
  // For demo purposes - in a real app, this would come from auth context/state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // Add this to track user role

  // Login function
  const handleLogin = (user) => { // Modified to accept user
    // If a user object is provided (even a mock one), consider login successful
    if (user) {
      setIsAuthenticated(true);
      setUserRole(user.role_code); // Store the user's role
      // For mock purposes, you might want to set a mock token if other parts rely on it
      // sessionStorage.setItem('mockToken', 'true'); 
    } else {
      // Fallback to token check if no user object is passed directly
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
      }
    }
  };
  
  // Logout function
  const handleLogout = () => {
    // Reset authentication state
    setIsAuthenticated(false);
    setUserRole(null); // Clear the user's role
    // Clear any mock token if you set one
    // sessionStorage.removeItem('mockToken');
    // localStorage.removeItem('token'); // Also clear real token if it was set
  };

  // Protected Route component
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      return <Navigate to="/login" replace />;
    }
    
    // If roles are specified and user's role doesn't match, redirect to home
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  return (
    <Router>
      <div className="min-h-screen bg-blue-100">
        <Header isAuthenticated={isAuthenticated} userRole={userRole} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/submit-ticket" element={<SubmitTicketPage />} />
            <Route 
              path="/login" 
              element={<LoginPage onLogin={handleLogin} />} 
            />            <Route path="/signup" element={<SignUpPage />} />            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password-verify" element={<ResetPasswordVerifyPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route 
              path="/view-tickets" 
              element={
                <ProtectedRoute>
                  <ViewTicketsPage />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/ticket/:ticketId"
              element={
                <ProtectedRoute>
                  <TicketDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/logout"
              element={
                <ProtectedRoute>
                  {/* Logout component that calls handleLogout and redirects */}
                  <Logout onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADM']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['ADM']}>
                  <AuditLogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chatroom/:conversationId"
              element={
                <ProtectedRoute>
                  <Chatroom />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>  );
}

export default App;