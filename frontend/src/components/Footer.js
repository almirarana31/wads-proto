import React from 'react';
import { Link } from 'react-router-dom';
import { Heading, Text, SmallText } from './text';

function Footer() {
  return (
    <footer className="bg-white py-8 px-4 shadow-inner mt-auto">
      <div className="max-w-6xl mx-auto">        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <Heading level={3} size="lg" weight="bold" className="text-blue-800 mb-3">Bianca Aesthetic Clinic</Heading>
            <Text color="text-gray-600">Your beauty and wellness partner</Text>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <Heading level={4} size="md" weight="semibold" className="mb-3">Support</Heading>
              <ul className="space-y-2">
                <li><Link to="/submit-ticket" className="text-gray-600 hover:text-blue-700">Submit a Ticket</Link></li>
                <li><Link to="/view-tickets" className="text-gray-600 hover:text-blue-700">View Tickets</Link></li>
              </ul>
            </div>
            
            <div>
              <Heading level={4} size="md" weight="semibold" className="mb-3">Account</Heading>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-gray-600 hover:text-blue-700">Login</Link></li>
                <li><Link to="/signup" className="text-gray-600 hover:text-blue-700">Register</Link></li>
              </ul>
            </div>
            
            <div>
              <Heading level={4} size="md" weight="semibold" className="mb-3">Contact</Heading>
              <ul className="space-y-2">
                <li><Text color="text-gray-600">klinikbianca@gmail.com</Text></li>
                <li><Text color="text-gray-600">+62 81383526324</Text></li>
              </ul>
            </div>
          </div>
        </div>
          <div className="mt-8 pt-6 border-t border-gray-200">
          <SmallText align="center" color="text-gray-500">
            © {new Date().getFullYear()} Powered by Klinik Kecantikan Bianca. All rights reserved.
          </SmallText>
        </div>
      </div>
    </footer>
  );
}

export default Footer;