import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }    try {      const response = await authService.login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      
      console.log('Server response:', response); // Debug log
        if (response && response.token) {
        // Clear any existing tokens first
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        
        // Store token in sessionStorage first
        sessionStorage.setItem('token', response.token);
        
        // If "Remember me" is checked, also store in localStorage as backup
        if (formData.rememberMe) {
          localStorage.setItem('token', response.token);
        }
        
        // Store user info and session expiration
        sessionStorage.setItem('user', JSON.stringify(response.user));
        // Set session expiration for 1 hour from now if not using remember me
        if (!formData.rememberMe) {
          const expiration = new Date().getTime() + 60 * 60 * 1000; // 1 hour
          sessionStorage.setItem('sessionExpires', expiration.toString());
        }
        
        // Call the onLogin function passed from App.js with user info
        onLogin(response.user);
        
        // Redirect to view tickets page
        navigate('/view-tickets');
      } else {
        console.error('Invalid response structure:', response); // Debug log
        setError('Server response missing token. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 pt-8 pb-12">
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white rounded-md shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-1">Login</h1>
          <p className="text-gray-600 text-center mb-8">Login to your account below</p>
          
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
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                disabled={loading}
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-blue-700 mb-2">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                disabled={loading}
              />
            </div>
            
            <div className="mb-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="mr-2"
                  disabled={loading}
                />
                <span>Remember me</span>
              </label>
            </div>
            
            <div className="flex justify-center mb-4">
              <button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white py-3 px-8 rounded-md text-lg font-medium disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
            
            <div className="text-center">
              <Link to="/forgot-password" className="text-gray-600 hover:underline block mb-4">
                Forgot your password?
              </Link>
              
              <div className="text-gray-600">
                Don't have an account? 
                <Link to="/signup" className="text-blue-600 hover:underline ml-1">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;