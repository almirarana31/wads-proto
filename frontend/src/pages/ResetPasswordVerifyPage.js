import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

function ResetPasswordVerifyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Verify token with backend
    const verifyToken = async () => {
      try {
        // In a real app, you would call your backend API
        const response = await fetch(`/api/users/verify-reset-token?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.status === 200) {
          // If token is valid, get the email from the response
          const data = await response.json();
          setIsValid(true);
          
          // Redirect to reset password page with token
          navigate(`/reset-password?token=${token}`);
        } else {
          // If token is invalid, show error
          setIsValid(false);
          setError('Invalid or expired password reset link. Please try again.');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsValid(false);
        setError('An error occurred while verifying your request. Please try again.');
      } finally {
        setIsVerifying(false);
      }
    };

    // Only verify if token exists
    if (token) {
      verifyToken();
    } else {
      setIsVerifying(false);
      setIsValid(false);
      setError('No reset token provided. Please request a password reset again.');
    }  }, [token, navigate]);

  // Show loading while verifying
  if (isVerifying) {
    return (
      <div className="min-h-screen py-6 sm:py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-md shadow-md p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">Verifying Reset Link</h1>
            <p className="text-center mb-6">
              Please wait while we verify your password reset link...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!isValid) {
    return (
      <div className="min-h-screen py-6 sm:py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-md shadow-md p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">Invalid Reset Link</h1>
            
            <p className="text-center text-red-600 mb-6">
              {error}
            </p>
            
            <div className="text-center">
              <Link 
                to="/forgot-password" 
                className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-6 rounded-md inline-block transition-colors"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );  }

  return null; // This shouldn't render as we redirect when valid
}

export default ResetPasswordVerifyPage;
