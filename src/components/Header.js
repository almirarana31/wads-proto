import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/Logo-Bianca-Clinic-Timeless-Beauty-Blue-1270x812.png';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="Bianca Aesthetic Clinic" />
        </Link>
      </div>
      <nav className="navigation">
        <Link to="/">HOME</Link>
        
        {/* Only show Submit Ticket if logged in */}
        {currentUser && (
          <Link to="/submit-ticket">SUBMIT TICKET</Link>
        )}
        
        {/* Only show View Tickets if logged in */}
        {currentUser && (
          <Link to="/view-tickets">VIEW TICKETS</Link>
        )}
        
        {/* Show Admin link only for admin users */}
        {currentUser && currentUser.role === 'admin' && (
          <Link to="/admin">ADMIN</Link>
        )}
        
        {/* Show Staff Dashboard only for staff/employee users */}
        {currentUser && (currentUser.role === 'employee' || currentUser.role === 'admin') && (
          <Link to="/manage-tickets">STAFF</Link>
        )}
        
        {/* Show Login/Logout based on authentication state */}
        {currentUser ? (
          <div className="user-section">
            <span className="welcome-text">Welcome, {currentUser.name}</span>
            <button onClick={logout} className="logout-btn">LOGOUT</button>
          </div>
        ) : (
          <Link to="/login">LOGIN</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;