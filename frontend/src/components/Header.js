import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/Logo-Bianca-Clinic-Timeless-Beauty-Blue-1270x812.png';

function Header({ isAuthenticated = false, userRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  //check if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // get active link class
  const getActiveLinkClass = (path) => {
    return isActive(path) 
      ? "text-blue-800 font-bold" 
      : "text-blue-700 hover:text-blue-600";
  };
    // authenticated user navigation
  const AuthenticatedNav = () => (
    <nav className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-4 md:gap-8 w-full md:w-auto items-center`}>
      <Link 
        to="/" 
        className={`${getActiveLinkClass('/')} font-medium`}
        onClick={() => setIsMenuOpen(false)}
      >
        HOME
      </Link>
      {userRole !== 'ADM' && (
        <>
          <Link 
            to="/submit-ticket" 
            className={`${getActiveLinkClass('/submit-ticket')} font-medium`}
            onClick={() => setIsMenuOpen(false)}
          >
            SUBMIT TICKET
          </Link>
          <Link 
            to="/view-tickets" 
            className={`${getActiveLinkClass('/view-tickets')} font-medium`}
            onClick={() => setIsMenuOpen(false)}
          >
            VIEW TICKETS
          </Link>
        </>
      )}      {userRole === 'ADM' && (
        <>
          <Link
            to="/admin-dashboard" 
            className={`${getActiveLinkClass('/admin-dashboard')} font-medium`}
            onClick={() => setIsMenuOpen(false)}
          >
            ADMIN DASHBOARD
          </Link>
          <Link
            to="/staff-dashboard" 
            className={`${getActiveLinkClass('/staff-dashboard')} font-medium`}
            onClick={() => setIsMenuOpen(false)}
          >
            STAFF DASHBOARD
          </Link>
          <Link
            to="/audit-logs" 
            className={`${getActiveLinkClass('/audit-logs')} font-medium`}
            onClick={() => setIsMenuOpen(false)}
          >
            AUDIT LOGS
          </Link>
        </>
      )}
      {userRole === 'STF' && (
        <Link
          to="/staff-dashboard" 
          className={`${getActiveLinkClass('/staff-dashboard')} font-medium`}
          onClick={() => setIsMenuOpen(false)}
        >
          STAFF DASHBOARD
        </Link>
      )}
      <Link
        to="/logout" 
        className={`${getActiveLinkClass('/logout')} font-medium`}
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
        className={`${getActiveLinkClass('/')} font-medium`}
        onClick={() => setIsMenuOpen(false)}
      >
        HOME
      </Link>
      <Link 
        to="/submit-ticket" 
        className={`${getActiveLinkClass('/submit-ticket')} font-medium`}
        onClick={() => setIsMenuOpen(false)}
      >
        SUBMIT TICKET
      </Link>
      <Link 
        to="/login" 
        className={`${getActiveLinkClass('/login')} font-medium`}
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
      <div className="w-6 h-0.5 bg-blue-700 mb-1"></div>
      <div className="w-6 h-0.5 bg-blue-700 mb-1"></div>
      <div className="w-6 h-0.5 bg-blue-700"></div>
    </button>
  );
  
  return (
    <header className="bg-white py-4 px-4 md:px-8 shadow-md">      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between items-center">
          <div onClick={() => navigate('/')} className="cursor-pointer">
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