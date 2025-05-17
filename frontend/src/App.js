import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function App() {
  // For demo purposes - in a real app, this would come from auth context/state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Mock login function
  const handleLogin = () => {
    setIsAuthenticated(true);
  };
  
  // Mock logout function
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

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
      <div className="min-h-screen bg-blue-100">
        <Header isAuthenticated={isAuthenticated} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/submit-ticket" element={<SubmitTicketPage />} />
            <Route 
              path="/login" 
              element={<LoginPage onLogin={handleLogin} />} 
            />            <Route path="/signup" element={<SignUpPage />} />
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
              path="/logout"
              element={
                <ProtectedRoute>
                  {/* Logout component that calls handleLogout and redirects */}
                  <Logout onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

// Simple Logout component that calls onLogout and redirects
function Logout({ onLogout }) {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    onLogout();
    navigate('/');
  }, [onLogout, navigate]);
  
  return <div>Logging out...</div>;
}

export default App;