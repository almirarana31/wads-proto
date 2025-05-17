import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // In a real app, you would call your backend API
      const response = await fetch('/api/users/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });
      
      // Even if the email doesn't exist, we still show success for security
      setSubmitted(true);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-blue-100 py-6 sm:py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-md shadow-md p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">Password Reset Email Sent</h1>
            
            <p className="text-center mb-6">
              If an account exists with the email <strong>{email}</strong>, 
              you will receive a password reset link shortly.
            </p>
            
            <div className="text-center">
              <Link 
                to="/login" 
                className="bg-bianca-blue hover:bg-bianca-dark-blue text-white py-2 px-6 rounded-md inline-block transition-colors"
              >
                Return to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-100 py-6 sm:py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-md shadow-md p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-1">Forgot Password</h1>
          <p className="text-gray-600 text-center mb-6 sm:mb-8">
            Enter your email address below and we'll send you a link to reset your password
          </p>
            {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-blue-700 mb-2">Email Address:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>
            
            <div className="flex justify-center mb-4">
              <button
                type="submit"
                disabled={loading}
                className={`bg-blue-700 hover:bg-blue-800 text-white py-3 px-8 rounded-md text-lg font-medium w-full sm:w-auto transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Sending...' : 'Reset Password'}
              </button>
            </div>
            
            <div className="text-center">
              <Link to="/login" className="text-blue-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;