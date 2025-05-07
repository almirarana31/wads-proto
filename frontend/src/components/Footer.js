import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-white py-8 px-4 shadow-inner mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-bold text-blue-800 mb-3">Bianca Aesthetic Clinic</h3>
            <p className="text-gray-600">Your beauty and wellness partner</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/submit-ticket" className="text-gray-600 hover:text-blue-700">Submit a Ticket</Link></li>
                <li><Link to="/view-tickets" className="text-gray-600 hover:text-blue-700">View Tickets</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3">Account</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-gray-600 hover:text-blue-700">Login</Link></li>
                <li><Link to="/signup" className="text-gray-600 hover:text-blue-700">Register</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3">Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-600">support@bianca-clinic.com</li>
                <li className="text-gray-600">+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-center text-gray-500">
            © {new Date().getFullYear()} Bianca Aesthetic Clinic. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;