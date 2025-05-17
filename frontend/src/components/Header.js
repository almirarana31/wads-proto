import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Header({ isAuthenticated = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Get active link class
  const getActiveLinkClass = (path) => {
    return isActive(path) 
      ? "text-blue-800 font-bold" 
      : "text-blue-700 hover:text-blue-600";
  };
  
  // Authenticated user navigation
  const AuthenticatedNav = () => (
    <nav className="flex gap-4 md:gap-8">
      <Link 
        to="/" 
        className={`${getActiveLinkClass('/')} font-medium`}
      >
        HOME
      </Link>
      <Link 
        to="/submit-ticket" 
        className={`${getActiveLinkClass('/submit-ticket')} font-medium`}
      >
        SUBMIT TICKET
      </Link>
      <Link 
        to="/view-tickets" 
        className={`${getActiveLinkClass('/view-tickets')} font-medium`}
      >
        VIEW TICKETS
      </Link>
      <Link 
        to="/settings" 
        className={`${getActiveLinkClass('/settings')} font-medium`}
      >
        SETTINGS
      </Link>
      <Link 
        to="/logout" 
        className={`${getActiveLinkClass('/logout')} font-medium`}
      >
        LOGOUT
      </Link>
    </nav>
  );
  
  // Guest user navigation
  const GuestNav = () => (
    <nav className="flex gap-4 md:gap-8">
      <Link 
        to="/" 
        className={`${getActiveLinkClass('/')} font-medium`}
      >
        HOME
      </Link>
      <Link 
        to="/submit-ticket" 
        className={`${getActiveLinkClass('/submit-ticket')} font-medium`}
      >
        SUBMIT TICKET
      </Link>
      <Link 
        to="/login" 
        className={`${getActiveLinkClass('/login')} font-medium`}
      >
        LOGIN
      </Link>
    </nav>
  );
  
  return (
    <header className="bg-white py-4 px-4 md:px-8 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div onClick={() => navigate('/')} className="cursor-pointer">
          <img 
            src="/api/placeholder/200/80" 
            alt="Bianca Aesthetic Clinic" 
            className="h-12" 
          />
        </div>
        
        {isAuthenticated ? <AuthenticatedNav /> : <GuestNav />}
      </div>
    </header>
  );
}

export default Header;