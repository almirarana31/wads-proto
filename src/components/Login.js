import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const { authenticate, currentUser, error } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page they were trying to access before being redirected to login
  const from = location.state?.from?.pathname || '/';
  
  useEffect(() => {
    // If user is already logged in, redirect appropriately
    if (currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/view-tickets');
      }
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const user = authenticate(formData.email, formData.password, rememberMe);
    
    if (user) {
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/view-tickets');
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Login to Help Desk</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberMe">Remember me</label>
        </div>
        
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      
      <div className="demo-credentials">
        <p>Demo Credentials:</p>
        <ul>
          <li>Admin: admin@bianca.com / admin123</li>
          <li>Staff: staff@bianca.com / staff123</li>
          <li>Customer: user@example.com / user123</li>
        </ul>
      </div>
    </div>
  );
};

export default Login;