import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout({ onLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all auth-related data
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('sessionExpires');
    localStorage.removeItem('token');
    
    // Call the onLogout handler from App.js
    onLogout();
    
    // Redirect to home page
    navigate('/');
  }, [onLogout, navigate]);

  return <div>Logging out...</div>;
}

export default Logout;
