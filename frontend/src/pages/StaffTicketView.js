import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContentContainer from '../components/ContentContainer';
import TicketDetailsCard from '../components/TicketDetailsCard';
import ConversationCard from '../components/ConversationCard';
import BackButton from '../components/buttons/BackButton';
import DangerButton from '../components/buttons/DangerButton';
import SuccessButton from '../components/buttons/SuccessButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import PrimaryButton from '../components/buttons/PrimaryButton';
import Modal from '../components/Modal';
import { PageTitle, Text, Subheading, Label } from '../components/text';

function StaffTicketView() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState('newest');
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  // Mock ticket data - replace with API call in real app
  const [ticket, setTicket] = useState({
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
  });

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
    // Navigate to the chat room with the current ticket ID and indicating it's a new conversation
    console.log('Starting new conversation for ticket:', ticketId);
    navigate(`/chatroom/${ticketId}/new`);
  };

  const handleConversationClick = (conversationId) => {
    navigate(`/chatroom/${ticketId}/${conversationId}`);
  };
  const handleResolveTicket = () => {
    setIsResolveModalOpen(true);
  };
  
  const handleCancelTicket = () => {
    setIsCancelModalOpen(true);
  };
  const confirmResolveTicket = () => {
    // Update the ticket status to 'Resolved'
    setTicket(prevTicket => ({
      ...prevTicket,
      status: 'Resolved',
      resolvedAt: new Date().toISOString()
    }));
    console.log('Resolving ticket:', ticketId);
    setIsResolveModalOpen(false);
  };

  const confirmCancelTicket = () => {
    // Update the ticket status to 'Cancelled'
    setTicket(prevTicket => ({
      ...prevTicket,
      status: 'Cancelled',
      cancelledAt: new Date().toISOString()
    }));
    console.log('Cancelling ticket:', ticketId);
    setIsCancelModalOpen(false);
  };

  return (
    <ContentContainer>      <div className="relative mb-5">
        <BackButton onClick={handleBack} className="absolute -top-2 -left-2" />
        <div className="text-center pt-8">
          <PageTitle title="Ticket Details" />
        </div>
      </div>      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        {/* Reusing TicketDetailsCard component */}
        <TicketDetailsCard ticket={ticket} />
          {/* Staff Actions */}        
        <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 mt-6">          
          {ticket.status !== 'Cancelled' && ticket.status !== 'Resolved' && (
            <>
              <DangerButton onClick={handleCancelTicket} className="w-full sm:w-auto">Cancel Ticket</DangerButton>
              <SuccessButton onClick={handleResolveTicket} className="w-full sm:w-auto">Resolve Ticket</SuccessButton>
            </>
          )}
          {ticket.status === 'Resolved' && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md text-center">
              This ticket has been resolved
            </div>
          )}
          {ticket.status === 'Cancelled' && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-center">
              This ticket has been cancelled
            </div>
          )}
        </div>        {/* Customer Information */}
        <div className="mt-8">
          <Subheading className="text-blue-800">Customer Information</Subheading>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text className="mb-2" color="text-gray-600">Name: <span className="font-medium text-gray-800 break-words">{ticket.customer.name}</span></Text>
                <Text className="mb-2" color="text-gray-600">Account: <span className="font-medium text-gray-800 break-words">{ticket.customer.accountType}</span></Text>
              </div>
              <div>
                <Text className="mb-2" color="text-gray-600">Email: <span className="font-medium text-gray-800 break-words">{ticket.customer.email}</span></Text>
                <Text className="mb-2" color="text-gray-600">Phone: <span className="font-medium text-gray-800 break-words">{ticket.customer.phone}</span></Text>
              </div>
            </div>
          </div>
        </div>{/* Conversations container */}
        {ticket.status !== 'Cancelled' ? (          <div className="mt-8">
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
        ) : (          <div className="mt-8">
            <div className="max-w-4xl mx-auto mt-6">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <Text color="text-gray-600" align="center">
                  No conversation history is available for cancelled tickets.
                </Text>
              </div>
            </div>          </div>
        )}
      </div>
        {/* Resolve Ticket Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Resolve Ticket"
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <SecondaryButton key="cancel" onClick={() => setIsResolveModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </SecondaryButton>
            <SuccessButton key="confirm" onClick={confirmResolveTicket} className="w-full sm:w-auto">
              Resolve Ticket
            </SuccessButton>
          </div>
        }
      >
        <Text>
          Are you sure you want to resolve ticket <strong>{ticket.id}</strong>: "{ticket.title}"?
        </Text>
        <Text color="text-green-600" className="mt-2">
          This will mark the ticket as resolved and the customer will be notified.
        </Text>
      </Modal>      {/* Cancel Ticket Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Ticket"
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <SecondaryButton key="cancel" onClick={() => setIsCancelModalOpen(false)} className="w-full sm:w-auto">
              Keep Ticket
            </SecondaryButton>
            <DangerButton key="confirm" onClick={confirmCancelTicket} className="w-full sm:w-auto">
              Cancel Ticket
            </DangerButton>
          </div>
        }
      >
        <Text>
          Are you sure you want to cancel ticket <strong>{ticket.id}</strong>: "{ticket.title}"?
        </Text>
        <Text color="text-red-600" className="mt-2">
          This action cannot be undone. The ticket will be marked as cancelled and the customer will be notified.
        </Text>
      </Modal>
    </ContentContainer>
  );
}

export default StaffTicketView;
