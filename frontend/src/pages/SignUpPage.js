import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';

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
      const response = await authService.signup(signUpData);
      
      // Redirect to success page after successful registration
      navigate('/success-signup', { state: { email: formData.email } });
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-100 py-6 md:py-12 px-4 flex-grow">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-md shadow-md p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-1">Sign Up</h1>
          <p className="text-gray-600 text-center mb-6 sm:mb-8">Create a new account</p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="username" className="block text-blue-700 mb-2">Username:</label>
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
              <label htmlFor="email" className="block text-blue-700 mb-2">Email Address:</label>
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
              <label htmlFor="password" className="block text-blue-700 mb-2">Password:</label>
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
              <label htmlFor="confirmPassword" className="block text-blue-700 mb-2">Confirm Password:</label>
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
              <button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-md text-base sm:text-lg font-medium w-full sm:w-auto disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
            <div className="text-center text-gray-600">
                Already have an account? 
                <Link to="/login" className="text-blue-600 hover:underline ml-1">
                Login
                </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;