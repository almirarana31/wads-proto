import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Logo-Bianca-Clinic-Timeless-Beauty-Blue-1270x812.png';
import { Menu, X } from 'lucide-react';

function Header({ isAuthenticated = false }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateToHome = () => {
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navigateToSubmitTicket = () => {
    navigate('/submit-ticket');
    setMobileMenuOpen(false);
  };

  const navigateToLogin = () => {
    navigate('/login');
    setMobileMenuOpen(false);
  };
  
  const navigateToViewTickets = () => {
    navigate('/view-tickets');
    setMobileMenuOpen(false);
  };
  
  const handleLogout = () => {
    // Add logout logic here
    navigate('/');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white py-4 px-4 md:px-8 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div onClick={navigateToHome} className="cursor-pointer">
          <img 
            src={logo} 
            alt="Bianca Aesthetic Clinic" 
            className="h-10 md:h-16 w-auto" 
            style={{ maxWidth: '180px', objectFit: 'contain' }}
          />
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={toggleMobileMenu}
            className="text-blue-800 focus:outline-none"
          >
            {mobileMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8">
          <button 
            onClick={navigateToHome}
            className="text-blue-800 hover:text-blue-600 font-medium"
          >
            HOME
          </button>
          <button 
            onClick={navigateToSubmitTicket}
            className="text-blue-800 hover:text-blue-600 font-medium"
          >
            SUBMIT TICKET
          </button>
          
          {isAuthenticated ? (
            <>
              <button 
                onClick={navigateToViewTickets}
                className="text-blue-800 hover:text-blue-600 font-medium"
              >
                VIEW TICKETS
              </button>
              <button 
                onClick={handleLogout}
                className="text-blue-800 hover:text-blue-600 font-medium"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <button 
              onClick={navigateToLogin}
              className="text-blue-800 hover:text-blue-600 font-medium"
            >
              LOGIN
            </button>
          )}
        </nav>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden mt-4 flex flex-col gap-4 py-3">
          <button 
            onClick={navigateToHome}
            className="text-blue-800 hover:text-blue-600 font-medium py-2 border-b border-gray-100"
          >
            HOME
          </button>
          <button 
            onClick={navigateToSubmitTicket}
            className="text-blue-800 hover:text-blue-600 font-medium py-2 border-b border-gray-100"
          >
            SUBMIT TICKET
          </button>
          
          {isAuthenticated ? (
            <>
              <button 
                onClick={navigateToViewTickets}
                className="text-blue-800 hover:text-blue-600 font-medium py-2 border-b border-gray-100"
              >
                VIEW TICKETS
              </button>
              <button 
                onClick={handleLogout}
                className="text-blue-800 hover:text-blue-600 font-medium py-2"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <button 
              onClick={navigateToLogin}
              className="text-blue-800 hover:text-blue-600 font-medium py-2"
            >
              LOGIN
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

export default Header;