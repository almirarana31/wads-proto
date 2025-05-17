import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TicketDetailsCard from '../components/TicketDetailsCard';

function TicketDetailsPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  // Mock ticket data - same as ViewTicketsPage, real app would fetch from API
  const tickets = [
    {
      id: 'TKT-001',
      title: 'Payment Failure',
      description: 'I have already paid, yet my appointment was not made.',
      status: 'Pending',
      category: 'Billing',
      created: '2025-04-16T19:11:36.632Z',
      unreadResponses: 0
    },
    {
      id: 'TKT-002',
      title: 'Payment Failure',
      description: 'I have already paid, yet my appointment was not made.',
      status: 'In Progress',
      category: 'Billing',
      created: '2025-04-16T19:11:36.632Z',
      unreadResponses: 1
    },
    {
      id: 'TKT-003',
      title: 'Payment Failure',
      description: 'I have already paid, yet my appointment was not made.',
      status: 'Resolved',
      category: 'Billing',
      created: '2025-04-16T19:11:36.632Z',
      unreadResponses: 0
    },
    {
      id: 'TKT-004',
      title: 'Refund Request',
      description: 'I would like to request a refund for my last appointment.',
      status: 'Pending',
      category: 'Service',
      created: '2025-05-17T16:38:25.632Z',
      unreadResponses: 2
    }
  ];

  // Find the ticket that matches the ID from the URL
  const ticket = tickets.find(t => t.id === ticketId) || {
    id: 'Not Found',
    title: 'Ticket Not Found',
    description: 'The requested ticket could not be found.',
    status: 'Unknown',
    category: 'Unknown',
    created: new Date().toISOString(),
    unreadResponses: 0
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-blue-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-md shadow-md p-8">
          <div className="relative mb-5">
            <button
              onClick={handleBack}
              className="absolute -top-2 -left-2 w-20 h-10 bg-blue-800 hover:bg-blue-900 text-white rounded-xl flex items-center justify-center shadow-md text-sm whitespace-nowrap"
            >
              ← Back
            </button>
            <div className="text-center pt-8">  {/* Added padding top */}
              <h1 className="text-4xl font-bold text-gray-800 mb-1">Ticket Details</h1>
            </div>
          </div>

          {/* Ticket Details Card */}
          <div className="max-w-4xl mx-auto">
            <TicketDetailsCard
              ticket={ticket}
              onViewDetails={() => {}}
            />
            <div className="flex justify-end gap-4 mt-6">
              <button
                className="w-32 h-12 bg-blue-800 hover:bg-blue-900 text-white rounded-xl flex items-center justify-center shadow-md text-sm whitespace-nowrap"
                onClick={() => {/* Edit handler, add later */}}
              >
                Edit Ticket
              </button>
              <button
                className="w-48 h-12 bg-blue-800 hover:bg-blue-900 text-white rounded-xl flex items-center justify-center shadow-md text-sm whitespace-nowrap"
                onClick={() => {/* Cancel handler, add later */}}
              >
                Request Cancellation
              </button>
            </div>
            <div className="border-b border-gray-200 my-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketDetailsPage;