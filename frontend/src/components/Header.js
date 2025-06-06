import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/Logo-Bianca-Clinic-Timeless-Beauty-Blue-1270x812.png';

function Header({ isAuthenticated = false, userRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // check if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // get active link class
  const getActiveLinkClass = (path) => {
    return isActive(path) 
      ? "text-bianca-primary font-extrabold" 
      : "text-bianca-primary hover:text-bianca-primary/80 font-bold";
  };
    // authenticated user navigation
  const AuthenticatedNav = () => (
    <nav className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-4 md:gap-8 w-full md:w-auto items-center`}>
      {userRole !== 'ADM' && (
        <Link 
          to="/" 
          className={`${getActiveLinkClass('/')}`}
          onClick={() => setIsMenuOpen(false)}
        >
          HOME
        </Link>
      )}
      {userRole !== 'ADM' && (
        <>
          <Link 
            to="/submit-ticket" 
            className={`${getActiveLinkClass('/submit-ticket')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            SUBMIT TICKET
          </Link>
          <Link 
            to="/view-tickets" 
            className={`${getActiveLinkClass('/view-tickets')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            VIEW TICKETS
          </Link>
        </>
      )}
      
      {userRole === 'ADM' && (
        <>
          <Link
            to="/admin-dashboard" 
            className={`${getActiveLinkClass('/admin-dashboard')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            ADMIN DASHBOARD
          </Link>
          <Link
            to="/audit-logs" 
            className={`${getActiveLinkClass('/audit-logs')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            AUDIT LOGS
          </Link>
        </>
      )}
      {userRole === 'STF' && (
        <Link
          to="/staff-dashboard" 
          className={`${getActiveLinkClass('/staff-dashboard')}`}
          onClick={() => setIsMenuOpen(false)}
        >
          STAFF DASHBOARD
        </Link>
      )}
      <Link
        to="/logout" 
        className={`${getActiveLinkClass('/logout')}`}
        onClick={() => setIsMenuOpen(false)}
      >
        LOGOUT
      </Link>
    </nav>
  );
  
  // guest user navigation
  const GuestNav = () => (
    <nav className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-4 md:gap-8 w-full md:w-auto items-center`}>
      <Link 
        to="/" 
        className={`${getActiveLinkClass('/')}`}
        onClick={() => setIsMenuOpen(false)}
      >
        HOME
      </Link>
      <Link 
        to="/submit-ticket" 
        className={`${getActiveLinkClass('/submit-ticket')}`}
        onClick={() => setIsMenuOpen(false)}
      >
        SUBMIT TICKET
      </Link>
      <Link 
        to="/login" 
        className={`${getActiveLinkClass('/login')}`}
        onClick={() => setIsMenuOpen(false)}
      >
        LOGIN
      </Link>
    </nav>
  );

  // hamburger menu button
  const HamburgerButton = () => (
    <button
      className="md:hidden p-2 focus:outline-none"
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      aria-label="Toggle menu"
    >
      <div className="w-6 h-0.5 bg-bianca-primary mb-1"></div>
      <div className="w-6 h-0.5 bg-bianca-primary mb-1"></div>
      <div className="w-6 h-0.5 bg-bianca-primary"></div>
    </button>
  );
  
  return (
    <header className="bg-white py-4 px-4 md:px-8 shadow-md">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between items-center">          <div onClick={() => navigate(userRole === 'ADM' ? '/admin-dashboard' : '/')} className="cursor-pointer">
            <img 
              src={logo}
              alt="Bianca Aesthetic Clinic"
              className="h-12"
            />
          </div>
          <div className="md:hidden">
            <HamburgerButton />
          </div>
          
          <div className={`w-full md:w-auto mt-4 md:mt-0 ${isMenuOpen ? 'block' : 'hidden md:block'}`}>
            {isAuthenticated ? <AuthenticatedNav /> : <GuestNav />}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;