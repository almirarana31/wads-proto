import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/buttons/PrimaryButton';

const MOCK_USERS = {
  'admin@bianca.com': {
    password: 'admin123',
    name: 'Admin User',
    role_code: 'ADM'
  },
  'staff@bianca.com': {
    password: 'staff123',
    name: 'Staff Member',
    role_code: 'STF'
  },
  'customer@bianca.com': {
    password: 'customer123',
    name: 'Customer User',
    role_code: 'USR'
  }
};

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
      // Mock login logic
      const mockUser = MOCK_USERS[formData.email];
      
      if (mockUser && mockUser.password === formData.password) {
        const userInfo = {
          email: formData.email,
          name: mockUser.name,
          role_code: mockUser.role_code
        };
        
        if (onLogin) onLogin(userInfo);
        
        // Redirect based on role
        if (mockUser.role_code === 'ADM') {
          navigate('/admin-dashboard');
        } else {
          navigate('/view-tickets');
        }
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
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
              <PrimaryButton
                type="submit"
                disabled={loading}
                fullWidth
              >
                {loading ? 'Logging in...' : 'Login'}
              </PrimaryButton>
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