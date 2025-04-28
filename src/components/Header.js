import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/Logo-Bianca-Clinic-Timeless-Beauty-Blue-1270x812.png';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);

  const isGuest = !currentUser;
  const isCustomer = currentUser?.role === 'customer';
  const isStaff = currentUser?.role === 'employee';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="Bianca Aesthetic Clinic" />
        </Link>
      </div>

      <nav className="navigation">
        {/* HOME only for non-admins */}
        {!isAdmin && <Link to="/">HOME</Link>}

        {/* Submit ticket for guests, customers and staff */}
        {(isGuest || isCustomer || isStaff) && <Link to="/submit-ticket">SUBMIT TICKET</Link>}

        {/* View tickets for customers only */}
        {isCustomer && <Link to="/view-tickets">VIEW TICKETS</Link>}

        {/* Staff can view their own tickets */}
        {isStaff && <Link to="/my-tickets">MY TICKETS</Link>}

        {/* Admin-only dashboard */}
        {isAdmin && <Link to="/admin">ADMIN</Link>}

        {/* Staff dashboard (employees only, not admins) */}
        {isStaff && <Link to="/manage-tickets">MANAGE TICKETS</Link>}

        {/* Auth section */}
        {currentUser ? (
          <div className="user-section">
            <span className="welcome-text">{currentUser.name}</span>
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