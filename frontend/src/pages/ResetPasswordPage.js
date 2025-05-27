import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import PrimaryButton from '../components/buttons/PrimaryButton';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch email associated with the token
    const fetchEmail = async () => {
      try {
        // In a real app, you would call your backend API
        const response = await fetch(`/api/users/verify-reset-token?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.status === 200) {
          const data = await response.json();
          setEmail(data.email);
          setLoading(false);
        } else {
          setError('Invalid or expired password reset token.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching email:', error);
        setError('An error occurred. Please try again.');
        setLoading(false);
      }
    };

    if (token) {
      fetchEmail();
    } else {
      setError('No reset token provided. Please request a password reset again.');
      setLoading(false);
    }
  }, [token]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mock functionality for UI development
    if (password && password === confirmPassword) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } else if (password !== confirmPassword) {
      setError('Passwords do not match.');
    } else {
      setError('Please enter and confirm your new password.');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-blue-100 py-6 sm:py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-md shadow-md p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">Reset Password</h1>
            <p className="text-center">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show success message
  if (success) {
    return (
      <div className="min-h-screen bg-blue-100 py-6 sm:py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-md shadow-md p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">Password Reset Successful</h1>
            
            <p className="text-center text-green-600 mb-6">
              Your password has been reset successfully! You will be redirected to the login page.
            </p>
            
            <div className="text-center">
              <Link 
                to="/login" 
                className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-6 rounded-md inline-block transition-colors"
              >
                Go to Login
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-1">Reset Password</h1>
          <p className="text-gray-600 text-center mb-6 sm:mb-8">
            Enter a new password for your account: <strong>{email}</strong>
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="password" className="block text-blue-700 mb-2">New Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                minLength="8"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-blue-700 mb-2">Confirm New Password:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                minLength="8"
              />
            </div>
            
            <div className="flex justify-center mb-4">
              <PrimaryButton
                type="submit"
                fullWidth
              >
                Reset Password
              </PrimaryButton>
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

export default ResetPasswordPage;
