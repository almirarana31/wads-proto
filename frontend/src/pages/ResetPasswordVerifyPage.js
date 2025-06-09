import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/authService';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { PageTitle, Text } from '../components/text';

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
        // Call the actual API endpoint
        await authService.validResetLink(token);
        setIsValid(true);
        
        // Redirect to reset password page with token
        navigate(`/reset-password?token=${token}`);
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsValid(false);
        const errorMessage = error.response?.data?.message || 'Invalid or expired password reset link. Please try again.';
        setError(errorMessage);
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
    }
  }, [token, navigate]);
  // Show loading while verifying
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-md shadow-md p-6 sm:p-8">
            <PageTitle title="Verifying Reset Link" />
            <Text align="center" className="mb-6">
              Please wait while we verify your password reset link...
            </Text>
          </div>
        </div>
      </div>
    );
  }
  // Show error if token is invalid
  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-md shadow-md p-6 sm:p-8">
            <PageTitle title="Invalid Reset Link" />
            
            <Text color="text-red-600" align="center" className="mb-6">
              {error}
            </Text>
            
            <div className="text-center">
              <PrimaryButton 
                onClick={() => navigate('/forgot-password')}
              >
                Request New Reset Link
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default ResetPasswordVerifyPage;
