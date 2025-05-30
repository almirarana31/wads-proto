import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContentContainer from '../components/ContentContainer';
import TicketDetailsCard from '../components/TicketDetailsCard';
import ConversationCard from '../components/ConversationCard';
import BackButton from '../components/buttons/BackButton';
import { PageTitle, Text, Subheading, Label } from '../components/text';

function AdminTicketView() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  
  // State for ticket data - in real app, would fetch from API
  const [ticket, setTicket] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  // Mock fetch ticket data - in real app, fetch from API based on ticketId
  useEffect(() => {
    // Simulating API call to get ticket details
    const mockTicket = {
      id: `TKT-${ticketId.toString().padStart(3, '0')}`,
      rawId: ticketId, // Keep the original ID for API calls
      title: 'Payment Failure',
      description: 'I have already paid, yet my appointment was not made.',
      status: 'In Progress',
      category: 'Billing',
      priority: 'High',
      created: '2025-04-16T19:11:36.632Z',
      lastUpdated: '2025-05-28T15:45:22.123Z',
      customer: {
        name: 'Customer Name',
        email: 'customer@example.com',
        phone: '123-456-7890'
      },
      assignedStaff: {
        id: 'staff123',
        name: 'Staff Member Name'
      }
    };

    setTicket(mockTicket);
  }, [ticketId]);

  // Mock conversations data - in real app, fetch from API
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
    navigate('/admin-dashboard');
  };

  const handleViewConversation = (conversationId) => {
    // Just view the conversation without ability to reply
    navigate(`/admin/chatroom/${ticketId}/${conversationId}`);
  };

  // Render loading state while data is being fetched
  if (!ticket) {
    return (
      <ContentContainer>
        <div className="flex justify-center items-center min-h-screen">
          <div className="spinner"></div>
          <Text>Loading ticket details...</Text>
        </div>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <div className="relative mb-5">
        <BackButton onClick={handleBack} className="absolute -top-2 -left-2" />
        <div className="text-center pt-8">
          <PageTitle title="Admin Ticket View" />
        </div>
      </div>
      
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        {/* Ticket Details Card */}
        <TicketDetailsCard ticket={ticket} />

        {/* Customer Information */}
        <div className="mt-8">
          <Subheading className="text-blue-800 mb-4">Customer Information</Subheading>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="text-gray-600 mb-2">Name: <span className="font-medium text-gray-800">{ticket.customer.name}</span></Text>
                <Text className="text-gray-600 mb-2">Email: <span className="font-medium text-gray-800">{ticket.customer.email}</span></Text>
              </div>
              <div>
                <Text className="text-gray-600 mb-2">Phone: <span className="font-medium text-gray-800">{ticket.customer.phone}</span></Text>
                <Text className="text-gray-600 mb-2">Created: <span className="font-medium text-gray-800">{new Date(ticket.created).toLocaleString()}</span></Text>
              </div>
            </div>
          </div>
        </div>

        {/* Conversations section */}
        {ticket.status !== 'Cancelled' ? (
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <Subheading className="text-blue-800">Conversation History</Subheading>
              <div className="flex items-center self-start sm:self-auto">
                <Label className="mr-2 whitespace-nowrap" size="sm">Sort by:</Label>
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
            
            {conversations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {conversations.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    number={conversation.number}
                    startedDate={conversation.startedDate}
                    endedDate={conversation.endedDate}
                    onClick={() => handleViewConversation(conversation.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
                <Text color="text-gray-600" align="center">
                  No conversations have been started for this ticket yet.
                </Text>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8">
            <Subheading className="text-blue-800 mb-4">Conversation History</Subheading>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <Text color="text-gray-600" align="center">
                No conversation history is available for cancelled tickets.
              </Text>
            </div>
          </div>
        )}
      </div>
    </ContentContainer>
  );
}

export default AdminTicketView;
