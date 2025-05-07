import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
    // In a real app, you would authenticate with your backend here
    navigate('/view-tickets');
  };

  return (
    <div className="bg-blue-100 py-6 md:py-12 px-4 flex-grow"> 
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-md shadow-md p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 text-center mb-1">Login</h1>
          <p className="text-gray-600 text-center mb-6 sm:mb-8">Login to your account below</p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-5 sm:mb-6">
              <label htmlFor="email" className="block text-blue-700 mb-2">Email Address:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>
            
            <div className="mb-5 sm:mb-6">
              <label htmlFor="password" className="block text-blue-700 mb-2">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
            </div>
            
            <div className="mb-5 sm:mb-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span>Remember me</span>
              </label>
            </div>
            
            <div className="flex justify-center mb-4 sm:mb-5">
              <button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white py-2 sm:py-3 px-6 sm:px-8 rounded-md text-base sm:text-lg font-medium w-full sm:w-auto"
              >
                Login
              </button>
            </div>
            
            <div className="text-center space-y-3 sm:space-y-4">
              <Link to="/forgot-password" className="text-gray-600 hover:underline block">
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