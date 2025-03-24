// ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, loading } = useContext(AuthContext);
  const location = useLocation();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  // Check if user is logged in
  if (!currentUser) {
    // Save the location they were trying to access for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If roles are specified, check if user has any of the allowed roles
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;