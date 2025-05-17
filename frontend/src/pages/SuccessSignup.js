import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import checkIcon from '../assets/accept.png';

function SuccessSignup() {
  const location = useLocation();
  // Get email from location state, fallback to example email
  const email = location.state?.email || 'user@example.com';

  return (
    <div className="min-h-screen bg-blue-100 py-6 sm:py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-md shadow-md p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Account Successfully Made!
          </h1>
          
          {/* Green checkmark icon */}
          <div className="flex justify-center mb-6">
            <img src={checkIcon} alt="Success" className="w-16 h-16" />
          </div>
          
          <p className="text-lg text-gray-600 mb-8">
            Verification link sent to <span className="text-blue-600">{email}</span>
          </p>
          
          <Link 
            to="/login" 
            className="inline-block bg-blue-700 hover:bg-blue-800 text-white py-3 px-8 rounded-md text-lg font-medium transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SuccessSignup;