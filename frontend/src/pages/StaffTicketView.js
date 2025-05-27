import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContentContainer from '../components/ContentContainer';
import TicketDetailsCard from '../components/TicketDetailsCard';
import ConversationCard from '../components/ConversationCard';
import BackButton from '../components/buttons/BackButton';
import DangerButton from '../components/buttons/DangerButton';
import SuccessButton from '../components/buttons/SuccessButton';
import PrimaryButton from '../components/buttons/PrimaryButton';

function StaffTicketView() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState('newest');

  // Mock ticket data - replace with API call in real app
  const ticket = {
    id: 'TKT-001',
    title: 'Payment Failure',
    description: 'I have already paid, yet my appointment was not made.',
    status: 'In Progress',
    category: 'Billing',
    created: '2025-04-16T19:11:36.632Z',
    priority: 'High',
    customer: {
      name: 'User Name',
      accountType: 'Registered',
      email: 'user@example.com',
      phone: '08123456789'
    }
  };

  // Use useMemo for both conversations data and sorting
  const conversations = useMemo(() => {
    const conversationsData = [
      {
        id: 1,
        number: 2,
        startedDate: '2025-04-16T19:11:36.632Z',
        endedDate: null
      },
      {
        id: 2,
        number: 1,
        startedDate: '2025-04-16T19:11:36.632Z',
        endedDate: '2025-04-16T19:11:36.632Z'
      }
    ];

    return conversationsData.sort((a, b) => {
      const dateA = new Date(a.startedDate);
      const dateB = new Date(b.startedDate);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [sortOrder]);

  const handleBack = () => {
    navigate('/staff-dashboard');
  };

  const handleStartConversation = () => {
    navigate(`/chatroom/${ticketId}/new`);
  };

  const handleConversationClick = (conversationId) => {
    navigate(`/chatroom/${ticketId}/${conversationId}`);
  };

  const handleResolveTicket = () => {
    // Add API call to resolve ticket
    console.log('Resolving ticket:', ticketId);
  };
  const handleCancelTicket = () => {
    // Add API call to cancel ticket
    console.log('Cancelling ticket:', ticketId);
  };

  return (
    <ContentContainer>
      <div className="relative mb-5">        <BackButton onClick={handleBack} className="absolute -top-2 -left-2" />
        <div className="text-center pt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-1">Ticket Details</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Reusing TicketDetailsCard component */}
        <TicketDetailsCard ticket={ticket} />
        
        {/* Staff Actions */}        <div className="flex justify-end gap-4 mt-6">          <DangerButton onClick={handleCancelTicket}>Cancel Ticket</DangerButton>
          <SuccessButton onClick={handleResolveTicket}>Resolve Ticket</SuccessButton>
        </div>

        {/* Customer Information */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-blue-800">Customer Information</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-gray-600">Name: <span className="font-medium text-gray-800">{ticket.customer.name}</span></p>
                <p className="mb-2 text-gray-600">Account: <span className="font-medium text-gray-800">{ticket.customer.accountType}</span></p>
              </div>
              <div>
                <p className="mb-2 text-gray-600">Email: <span className="font-medium text-gray-800">{ticket.customer.email}</span></p>
                <p className="mb-2 text-gray-600">Phone: <span className="font-medium text-gray-800">{ticket.customer.phone}</span></p>
              </div>
            </div>
          </div>
        </div>        {/* Conversations container */}
        {ticket.status !== 'Cancelled' ? (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-blue-800">Conversation History</h2>
              <div className="flex items-center">
                <label htmlFor="sort-order" className="mr-2 text-sm text-gray-600">Sort by:</label>
                <select
                  id="sort-order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {conversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  number={conversation.number}
                  startedDate={conversation.startedDate}
                  endedDate={conversation.endedDate}
                  onClick={() => handleConversationClick(conversation.id)}
                />
              ))}
            </div>            <PrimaryButton onClick={handleStartConversation} fullWidth>
              Start a New Conversation
            </PrimaryButton>
          </div>
        ) : (
          <div className="mt-8">
            <div className="max-w-4xl mx-auto mt-6">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-gray-600 text-center">
                  No conversation history is available for cancelled tickets.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ContentContainer>
  );
}

export default StaffTicketView;
