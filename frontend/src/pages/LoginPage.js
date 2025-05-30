import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { PageTitle, Text, Label } from '../components/text';
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
    }
    try {
      // Call backend login
      const res = await authService.login(formData);
      // Store tokens
      if (res.sessionToken) {
        sessionStorage.setItem('token', res.sessionToken);
      }
      if (formData.rememberMe && res.localToken) {
        localStorage.setItem('token', res.localToken);
      }
      const role = await authService.getUserRoles();
      if (role.isAdmin) {
        window.location.href = '/admin-dashboard';
      } else if (role.isStaff) {
        window.location.href = '/staff-dashboard';
      } else if (role.isUser) {
        window.location.href = '/view-tickets';
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-12">      
    <div className="max-w-md mx-auto p-6">
        <div className="bg-white rounded-md shadow-md p-8">
          <PageTitle title="Login" subtitle="Login to your account below" className="mb-8" />
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <Label htmlFor="email">Email Address:</Label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                disabled={loading}
              />            </div>
            
            <div className="mb-6">
              <Label htmlFor="password">Password:</Label>
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
              <PrimaryButton
                type="submit"
                disabled={loading}
                fullWidth
              >
                {loading ? 'Logging in...' : 'Login'}
              </PrimaryButton>
            </div>
            
            <div className="text-center">
              <Text color="gray" center className="hover:underline block mb-4">
                <Link to="/forgot-password">
                  Forgot your password?
                </Link>
              </Text>
              
              <Text color="gray" center>
                Don't have an account? 
                <Link to="/signup" className="text-blue-600 hover:underline ml-1">
                  Sign up
                </Link>
              </Text>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;