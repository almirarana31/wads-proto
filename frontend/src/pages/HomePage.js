import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  const handleNavigateToTicketPage = () => {
    navigate('/submit-ticket');
  };

  const handleNavigateToViewTickets = () => {
    navigate('/view-tickets');
  };

  return (
    <div className="text-center bg-blue-100 py-4 md:py-6 px-4 flex-grow flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-6 md:p-10 rounded shadow-md max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
          Welcome to Bianca Aesthetic Helpdesk
        </h1>
        
        <p className="text-lg md:text-xl text-blue-800 mb-4">
          Need assistance? Submit a ticket and our team will assist you.
        </p>
        
        <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">
          Registered users can log in to view responses in-app, while
          guests will receive replies via email or phone.
        </p>
        
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
          <button 
            onClick={handleNavigateToTicketPage}
            className="bg-blue-700 hover:bg-blue-800 text-white py-3 px-6 rounded-md text-lg font-medium transition-colors w-full sm:w-auto"
          >
            Submit a Ticket
          </button>
          
          <button 
            onClick={handleNavigateToViewTickets}
            className="bg-white hover:bg-gray-100 text-blue-700 border border-blue-700 py-3 px-6 rounded-md text-lg font-medium transition-colors w-full sm:w-auto"
          >
            View your Tickets
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;