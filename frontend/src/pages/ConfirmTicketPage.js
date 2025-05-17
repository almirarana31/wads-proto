import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import checkIcon from '../assets/accept.png';

function ConfirmTicketPage() {
  const location = useLocation();
  
  // Format date to match the design in the image
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toISOString(); // In a real app, you'd format this better
    } catch (error) {
      return dateString;
    }
  };

  // Get ticket data from location state or use default values
  // In a real app, you might also fetch this from an API if needed
  const ticketData = location.state?.ticket || {
    ticketId: 'TKT-001',
    title: 'Payment Failed',
    createdAt: '2025-04-16T19:11:36.632Z',
    email: 'user@example.com',
    phone: '08123456789'
  };

  return (
    <div className="min-h-screen bg-blue-100 py-6 sm:py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-md shadow-md p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
            Ticket Submitted Successfully!
          </h1>
            {/* Green checkmark icon */}
          <div className="flex justify-center mb-6">
            <img src={checkIcon} alt="Success" className="w-16 h-16" />
          </div>
          
          {/* Ticket details section */}
          <div className="bg-gray-100 p-4 rounded-md mb-6">
            <p className="mb-1">Ticket ID: <span className="text-blue-600 font-medium">{ticketData.ticketId}</span></p>
            <p className="mb-1">Title: <span className="text-blue-600 font-medium">{ticketData.title}</span></p>
            <p className="mb-4">Created at: <span className="font-medium">{formatDate(ticketData.createdAt)}</span></p>
            
            <hr className="my-4 border-gray-300" />
            
            <p className="mb-1">We'll contact you via</p>
            <p className="mb-1">Email: <span className="text-blue-600 font-medium">{ticketData.email}</span></p>
            <p className="mb-1">Phone: <span className="text-blue-600 font-medium">{ticketData.phone}</span></p>
          </div>
          
          <p className="text-gray-600 text-center mb-6">
            Our support team will review your ticket and respond as soon as possible. 
            You will receive updates through your provided contact method.
          </p>
          
          <p className="text-gray-600 text-center mb-8">
            You can view the status of this ticket and all your other tickets in <Link to="/your-tickets" className="text-blue-600 hover:underline">Your Tickets</Link>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/submit-ticket" 
                  className="text-center border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-md transition-colors">
              Submit another Ticket
            </Link>
            
            <Link to="/view-tickets"
                  className="text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
              View your Tickets
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmTicketPage;