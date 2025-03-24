// Unauthorized.js
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <h2>Access Denied</h2>
      <p>You do not have permission to access this page.</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );
};

export default Unauthorized;