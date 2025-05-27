import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TicketDetailsCard from '../components/TicketDetailsCard';
import ConversationCard from '../components/ConversationCard';
import ContentContainer from '../components/ContentContainer';
import Modal from '../components/Modal';
import BackButton from '../components/buttons/BackButton';
import DangerButton from '../components/buttons/DangerButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { PageTitle, Text, Subheading, Label, SmallText } from '../components/text';

function TicketDetailsPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState('newest');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: ''
  });

  // Use useMemo for both tickets data and finding current ticket
  const { ticket, tickets } = useMemo(() => {
    const ticketsData = [
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

    return {
      tickets: ticketsData,
      ticket: ticketsData.find(t => t.id === ticketId)
    };
  }, [ticketId]);

  const editFormInitialState = useMemo(() => ({
    title: ticket.title,
    description: ticket.description,
    category: ticket.category
  }), [ticket.title, ticket.description, ticket.category]);

  // Initialize edit form when ticket is loaded
  useEffect(() => {
    setEditForm(editFormInitialState);
  }, [editFormInitialState]);  const handleEditSubmit = () => {
    // Only allow editing of pending tickets
    if (ticket.status !== 'Pending') {
      setIsEditModalOpen(false);
      return;
    }

    // Update the current ticket with the edited values
    const updatedTicket = {
      ...ticket,
      ...editForm,
      // Status should remain Pending since we can only edit pending tickets
      status: 'Pending',
      lastUpdatedAt: new Date().toISOString()
    };
    setCurrentTicket(updatedTicket);
    setIsEditModalOpen(false);
  };
  const handleCancelTicket = () => {
    // Only allow cancellation of pending tickets
    if (ticket.status !== 'Pending') {
      setIsCancelModalOpen(false);
      return;
    }

    // Update the current ticket with cancelled status
    const updatedTicket = {
      ...ticket,
      status: 'Cancelled',
      cancelledAt: new Date().toISOString()
    };
    setCurrentTicket(updatedTicket);
    setIsCancelModalOpen(false);
    // In a real app, you would make an API call here
    // and then either redirect or update the ticket status
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
    <ContentContainer>      <div className="relative mb-5">
        <BackButton onClick={handleBack} className="absolute -top-2 -left-2" />
        <div className="text-center pt-8">
          <PageTitle title="Ticket Details" />
        </div>
      </div>

      {/* Ticket Details Card */}
      <div className="max-w-4xl mx-auto">
        <TicketDetailsCard
          ticket={ticket}
          onViewDetails={() => {}}
        />
        <div className="flex justify-end gap-4 mt-6">          {ticket.status === 'Pending' && (
            <>              <PrimaryButton onClick={() => setIsEditModalOpen(true)} className="w-32">
                Edit Ticket
              </PrimaryButton>
              <DangerButton onClick={() => setIsCancelModalOpen(true)} className="w-32">
                Cancel Ticket
              </DangerButton>
            </>
          )}
        </div>        {ticket.status === 'Cancelled' ? (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <Text color="text-red-800" align="center">
              This ticket has been cancelled and can no longer be modified.
            </Text>
          </div>
        ) : ticket.status !== 'Pending' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <Text color="text-blue-800" align="center">
              This ticket is {ticket.status.toLowerCase()} and can no longer be modified.
            </Text>
          </div>
        )}
        <div className="border-b border-gray-200 my-6"></div>
      </div>

      {/* Conversations container */}      {ticket.status !== 'Cancelled' ? (        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <Subheading className="text-blue-800">Conversation History</Subheading>
            <div className="flex items-center">
              <Label className="mr-2" size="sm">Sort by:</Label>
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
        </div>      ) : (
        <div className="max-w-4xl mx-auto mt-6">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <Text color="text-gray-600" align="center">
              No conversation history is available for cancelled tickets.
            </Text>
          </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Ticket"
        actions={
          <>            <SecondaryButton onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleEditSubmit}>
              Save Changes
            </PrimaryButton>
          </>
        }
      >        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="3"
            />
          </div>
          <div>
            <Label>Category</Label>
            <select
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="Billing">Billing</option>
              <option value="Technical">Technical</option>
              <option value="General">General</option>
              <option value="Service">Service</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Cancel Ticket Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Ticket"
        actions={
          <>
            <button
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              No, Keep Ticket
            </button>
            <button
              onClick={handleCancelTicket}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Yes, Cancel Ticket
            </button>
          </>
        }      >
        <Text color="text-gray-600">
          Are you sure you want to cancel this ticket? This action cannot be undone.
        </Text>
      </Modal>
    </ContentContainer>
  );
}

export default TicketDetailsPage;