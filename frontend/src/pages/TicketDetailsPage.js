import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TicketDetailsCard from '../components/TicketDetailsCard';
import ConversationCard from '../components/ConversationCard';
import ContentContainer from '../components/ContentContainer';

function TicketDetailsPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState('newest');

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

  // Find the ticket that matches the ID from the URL || This will be replaced with an API call later
  const ticket = tickets.find(t => t.id === ticketId) || {
    id: 'Not Found',
    title: 'Ticket Not Found',
    description: 'The requested ticket could not be found.',
    status: 'Unknown',
    category: 'Unknown',
    created: new Date().toISOString(),
    unreadResponses: 0
  };

  // Mock data for conversations - would fetch from API when implemented with backend
  const conversations = [
    {
      id: 1,
      number: 1,
      startedDate: '2025-05-18T10:30:00Z',
      endedDate: '2025-05-18T11:15:00Z'
    },
    {
      id: 2,
      number: 2,
      startedDate: '2025-05-19T14:45:00Z',
      endedDate: '2025-05-19T15:30:00Z'
    },
    {
      id: 3,
      number: 3,
      startedDate: '2025-05-20T09:00:00Z',
      endedDate: null
    },
    {
      id: 4,
      number: 4,
      startedDate: '2025-05-21T16:20:00Z',
      endedDate: '2025-05-21T17:05:00Z'
    }
  ];

  // Sorts conversations based on ordder
  const sortedConversations = [...conversations].sort((a, b) => {
    const dateA = new Date(a.startedDate);
    const dateB = new Date(b.startedDate);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleConversationClick = (id) => {
    navigate(`/chatroom/${id}`);
    // Routes to chatroom page with conversation ID || In real app, replaced with API call
  };

  return (
    <ContentContainer>
      <div className="relative mb-5">
        <button
          onClick={handleBack}
          className="absolute -top-2 -left-2 w-20 h-10 bg-blue-800 hover:bg-blue-900 text-white rounded-xl flex items-center justify-center shadow-md text-sm whitespace-nowrap"
        >
          ← Back
        </button>
        <div className="text-center pt-8">
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

      {/* Conversations container */}
      <div className="max-w-4xl mx-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedConversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              number={conversation.number}
              startedDate={conversation.startedDate}
              endedDate={conversation.endedDate}
              onClick={() => handleConversationClick(conversation.id)}
            />
          ))}
        </div>
      </div>
    </ContentContainer>
  );
}

export default TicketDetailsPage;