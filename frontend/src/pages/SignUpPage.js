import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import checkIcon from '../assets/accept.png';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { PageTitle, Text, Label, Heading } from '../components/text';

function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Simple validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...signUpData } = formData;
      await authService.signup(signUpData);
      
      // Show success message after successful registration
      setSuccessEmail(formData.email);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to create account'
      );
    } finally {
      setLoading(false);
    }
  };  if (success) {
    return (
      <div className="min-h-screen py-6 sm:py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white rounded-md shadow-md p-8 text-center">
            <Heading level={1} center className="mb-8">
              Account Successfully Made!
            </Heading>
            <div className="flex justify-center mb-6">
              <img src={checkIcon} alt="Success" className="w-16 h-16" />
            </div>
            <Text size="lg" center className="mb-8">
              Verification link sent to <span className="text-blue-600">{successEmail || 'user@example.com'}</span>
            </Text>
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
  return (
    <div className="py-6 md:py-12 px-4 flex-grow">      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-md shadow-md p-6 sm:p-8">
          <PageTitle title="Sign Up" subtitle="Create a new account" className="mb-6 sm:mb-8" />
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <Label htmlFor="username">Username:</Label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                disabled={loading}
              />            
              </div>
            
            <div>
              <Label htmlFor="email">Email Address:</Label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password:</Label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                disabled={loading}
              />
            </div>
            
            <div className="mb-6 sm:mb-8">
              <Label htmlFor="confirmPassword">Confirm Password:</Label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                disabled={loading}
              />
            </div>
            
            <div className="flex justify-center">
              <PrimaryButton
                type="submit"
                disabled={loading}
                fullWidth
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </PrimaryButton>
            </div>
            <Text center color="gray">
                Already have an account? 
                <Link to="/login" className="text-blue-600 hover:underline ml-1">
                Login
                </Link>
            </Text>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;