import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import { PageTitle, Text } from '../components/text';
import { authService } from '../api/authService';

function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for localToken (remember me)
    const localToken = localStorage.getItem('token');
    if (localToken) {
      // Set token in sessionStorage for axios interceptor
      sessionStorage.setItem('token', localToken);
      // Call backend to get user roles
      authService.getUserRoles
        .then((roles) => {
          if (roles.isAdmin) {
            navigate('/admin-dashboard');
          } else if (roles.isStaff) {
            navigate('/staff-dashboard');
          } else if (roles.isUser) {
            navigate('/view-tickets');
          }
        })
        .catch(() => {
          // If token is invalid, clear it and let user login
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
        });
    }
    // If no localToken, do nothing (let user login or use as guest)
  }, [navigate]);

  const handleNavigateToTicketPage = () => {
    navigate('/submit-ticket');
  };

  const handleNavigateToViewTickets = () => {
    navigate('/view-tickets');
  };  return (
    <div className="text-center py-4 md:py-6 px-4 flex-grow flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-6 md:p-10 rounded shadow-md max-w-4xl mx-auto">
        <PageTitle 
          title="Welcome to Bianca Aesthetic Helpdesk"
          className="mb-4"
        />
        
        <Text size="lg" color="blue-darker" center className="mb-4">
          Need assistance? Submit a ticket and our team will assist you.
        </Text>
        
        <Text size="base" color="gray" center className="mb-6 md:mb-8">
          Registered users can log in to view responses in-app, while
          guests will receive replies via email or phone.
        </Text>
        
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
          <PrimaryButton 
            onClick={handleNavigateToTicketPage}
            className="w-full sm:w-auto"
          >
            Submit a Ticket
          </PrimaryButton>
          
          <SecondaryButton 
            onClick={handleNavigateToViewTickets}
            className="w-full sm:w-auto"
          >
            View your Tickets
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}

export default HomePage;