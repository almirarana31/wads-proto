import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { PageTitle, Text, Label } from '../components/text';

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
      <div className="min-h-screen py-6 sm:py-12 px-4">        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-md shadow-md p-6 sm:p-8">
            <PageTitle title="Reset Password" />
            <Text align="center">Loading...</Text>
          </div>
        </div>
      </div>
    );  }

  // Show success message
  if (success) {
    return (
      <div className="min-h-screen py-6 sm:py-12 px-4">        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-md shadow-md p-6 sm:p-8">
            <PageTitle title="Password Reset Successful" />
            
            <Text color="text-green-600" align="center" className="mb-6">
              Your password has been reset successfully! You will be redirected to the login page.
            </Text>
            
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
    <div className="min-h-screen py-6 sm:py-12 px-4">      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-md shadow-md p-6 sm:p-8">
          <PageTitle 
            title="Reset Password"
            subtitle={
              <>
                Enter a new password for your account: <strong>{email}</strong>
              </>
            }
          />
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
            <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <Label htmlFor="password">New Password:</Label>
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
              <Label htmlFor="confirmPassword">Confirm New Password:</Label>
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
              <Link to="/login" className="text-bianca-primary hover:underline">
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
