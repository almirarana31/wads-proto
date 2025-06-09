import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './api/authService';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SubmitTicketPage from './pages/SubmitTicketPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage'; // Fixed casing to match actual filename
import ViewTicketsPage from './pages/ViewTicketsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordVerifyPage from './pages/ResetPasswordVerifyPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Footer from './components/Footer';
import TicketDetailsPage from './pages/TicketDetailsPage';
import Logout from './components/Logout';
import AdminDashboard from './pages/AdminDashPage';
import Chatroom from './pages/Chatroom';
import AuditLogPage from './pages/AuditLogPage';
import StaffDashPage from './pages/StaffDashPage';
import StaffTicketView from './pages/StaffTicketView';
import AdminTicketView from './pages/AdminTicketView';
import ActivateAccountPage from './pages/ActivateAccountPage';
import Chatbot from './components/Chatbot';

function App() {
  // For demo purposes - in a real app, this would come from auth context/state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // Add this to track user role
  
  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (token) {
        try {
          const roles = await authService.getUserRoles();
          setIsAuthenticated(true);
          if (roles.isAdmin) {
            setUserRole('ADM'); 
          }
          else if (roles.isStaff) {
            setUserRole('STF')
          }
          else if (roles.isUser) {
            setUserRole('USR') 
          }
          else setUserRole(null);
        } catch (err) {
          // Only clear auth if error is 401/403 (token invalid/expired)
          if (err?.response?.status === 401 || err?.response?.status === 403) {
            setIsAuthenticated(false);
            setUserRole(null);
            sessionStorage.removeItem('token');
            localStorage.removeItem('token');
          }
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const handleLogin = (user) => {
    setIsAuthenticated(true);
    // Set userRole based on isAdmin/isStaff/isUser flags
    if (user && user.isAdmin) setUserRole('ADM');
    else if (user && user.isStaff) setUserRole('STF');
    else setUserRole('USR');
    localStorage.setItem('currentUser', JSON.stringify(user));
  };
    // Logout function
  const handleLogout = () => {
    // Reset authentication state
    setIsAuthenticated(false);
    setUserRole(null); // Clear the user's role
    // Clear stored user data
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('mockToken');
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
  };

  // Protected Route component
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!isAuthenticated) {
      // Show nothing while checking auth (prevents flicker)
      return null;
    }
    // If roles are specified and user's role doesn't match, redirect to home
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
    return children;
  };
  return (
    <Router>
      <div className="min-h-screen bg-bianca-background">
        <Header isAuthenticated={isAuthenticated} userRole={userRole} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/submit-ticket" element={<SubmitTicketPage />} />
            <Route 
              path="/login" 
              element={<LoginPage onLogin={handleLogin} />} 
            />            
            <Route path="/signup" element={<SignupPage />} />            
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
            />            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADM']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />            <Route
              path="/staff-dashboard"
              element={
                <ProtectedRoute allowedRoles={['STF', 'ADM']}>
                  <StaffDashPage />
                </ProtectedRoute>
              }
            />            <Route
              path="/staff/ticket/:ticketId"
              element={
                <ProtectedRoute allowedRoles={['STF', 'ADM']}>
                  <StaffTicketView />
                </ProtectedRoute>
              }
            />            <Route
              path="/admin/ticket/:ticketId"
              element={
                <ProtectedRoute allowedRoles={['ADM']}>
                  <AdminTicketView />
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
            />            <Route
              path="/chatroom/:ticketId/:conversationId"
              element={
                <ProtectedRoute>
                  <Chatroom />
                </ProtectedRoute>
              }
            />
            <Route path="/activate/:token" element={<ActivateAccountPage />} />
          </Routes>
        </main>
        <Footer />
        {/* Add Chatbot here - it will handle its own visibility logic */}
        <Chatbot isAuthenticated={isAuthenticated} userRole={userRole} />
      </div>
    </Router>  );
}

export default App;