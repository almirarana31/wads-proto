import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TicketDetailsCard from '../components/TicketDetailsCard';
import ConversationCard from '../components/ConversationCard';
import ContentContainer from '../components/ContentContainer';
import Modal from '../components/Modal';
import BackButton from '../components/buttons/BackButton';
import DangerButton from '../components/buttons/DangerButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { PageTitle, Text, Subheading, Label } from '../components/text';
import { authService } from '../api/authService';

function TicketDetailsPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState('newest');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [conversationsError, setConversationsError] = useState(null);  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: ''
  });
  
  // Modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch ticket details when component mounts
  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {        setIsLoading(true);
        const response = await authService.getTicketDetail(ticketId);
          console.log('API Response:', response); // Add this for debugging
        
        // The ticket data is directly in the response object, not nested under 'ticket'
        if (!response || !response.id) {
          throw new Error('Invalid response format from server');
        }
        
        const ticketData = response;
          // Transform backend data to match frontend structure
        const formattedTicket = {
          id: `TKT-${ticketData.id.toString().padStart(3, '0')}`,  // Format as TKT-001
          rawId: ticketData.id, // Keep original ID for API calls
          title: ticketData.subject,
          description: ticketData.description,
          status: ticketData.Status ? ticketData.Status.name : ticketData.status,
          category: ticketData.Category ? ticketData.Category.name : ticketData.category,
          created: ticketData.createdAt,
          unreadResponses: ticketData.unreadResponses || 0
        };
        
        setTicket(formattedTicket);
        
        // Initialize edit form
        setEditForm({
          title: formattedTicket.title,
          description: formattedTicket.description,
          category: formattedTicket.category
        });

        if (response.Conversations || response.conversations) {
          try {
            const conversationData = response.Conversations || response.conversations || [];
            if (conversationData.length > 0) {
              setConversations(conversationData.map(conv => ({
                id: conv.id,
                number: conv.number || conv.id,
                startedDate: conv.startedAt || conv.createdAt,
                endedDate: conv.endedAt || conv.updatedAt
              })));
            }
          } catch (convErr) {
            console.error('Error processing conversations:', convErr);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching ticket details:', err);
        console.error('Error message:', err.message);
        if (err.response) {
          console.error('Error response status:', err.response.status);
          console.error('Error response data:', err.response.data);
        }
        setError('Failed to load ticket details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (ticketId) {
      fetchTicketDetails();
    }
  }, [ticketId]);  // Handle edit form submission
  const handleEditSubmit = async () => {
    // Only allow editing of pending tickets
    if (!ticket || ticket.status !== 'Pending') {
      setIsEditModalOpen(false);
      return;
    }

    try {
      setIsLoading(true);
      const ticketData = {
        title: editForm.title,
        description: editForm.description,
        category_id: getCategoryId(editForm.category)
      };
      // console.log('WE are changing');
      console.log('Ticket Data:', ticketData);
      
      await authService.editTicket(ticketId, ticketData);
      
      // Update the ticket in state with the edited values
      setTicket(prevTicket => ({
        ...prevTicket,
        title: editForm.title,
        description: editForm.description,
        category: editForm.category
      }));
      
      setIsEditModalOpen(false);    } catch (err) {
      console.error('Error updating ticket:', err);
      setErrorMessage('Failed to update ticket. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
    console.log('Edit form submitted:', editForm);
  };

  // Helper function to map category name to ID
  const getCategoryId = (categoryName) => {
    const categoryMap = {
      'General': 1,
      'Billing': 2,
      'IT Support': 3,
    };
    return categoryMap[categoryName] || 1; // Default to 'General' if not found
  };
  
  // Handle cancel ticket
  const handleCancelTicket = async () => {
    // Only allow cancellation of pending tickets
    if (!ticket || ticket.status !== 'Pending') {
      setIsCancelModalOpen(false);
      return;
    }

    try {      setIsLoading(true);
      const response = await authService.cancelTicket(ticketId);
      console.log('Cancel response:', response);
      
      // Update the ticket in state with cancelled status
      setTicket(prevTicket => ({
        ...prevTicket,
        status: 'Cancelled'
      }));
      
      setIsCancelModalOpen(false);
    } catch (err) {
      console.error('Error cancelling ticket:', err);
      console.error('Error message:', err.message);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
      alert('Failed to cancel ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  // Sort conversations
  const sortedConversations = conversations.length > 0 
    ? (sortOrder === 'newest'
        ? [...conversations].sort((a, b) => new Date(b.startedDate) - new Date(a.startedDate))
        : [...conversations].sort((a, b) => new Date(a.startedDate) - new Date(b.startedDate)))
    : [];

  // Handle navigation
  const handleBack = () => {
    navigate(-1);
  };
  // Handle conversation click
  const handleConversationClick = (conversationId, conversationNumber) => {
    sessionStorage.setItem(`conversation_number_${conversationId}`, conversationNumber);
    navigate(`/chatroom/${ticketId}/${conversationId}`);
  };
  // Fetch conversations for the ticket
  const fetchConversations = async () => {
    if (!ticket) return;
    
    try {
      setIsLoadingConversations(true);
      const rawTicketId = ticket.rawId;
      // use newest instead of sorted because feature is ggone
      const conversationHistory = await authService.getConversationHistory(rawTicketId, 'newest');

      // Format conversation data
      const formattedConversations = conversationHistory.map(conv => ({
        id: conv.id,
        startedDate: conv.createdAt,
        // For closed conversations, use updatedAt as the closed date
        endedDate: conv.endedAt || (conv.closed ? conv.updatedAt : null),
        status: conv.closed === true ? 'closed' : 'open',
        messages: conv.Messages?.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender_type,
          senderName: msg.sender_name,
          timestamp: new Date(msg.createdAt).toLocaleString()
        })) || []
      }));
      
      // Process and number conversations (not rlly needed anymore)
      const numberedConversations = processConversationsWithNumbers(formattedConversations);
      
      setConversations(numberedConversations);
      setConversationsError(null);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setConversationsError('Failed to load conversations. Please try again.');
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // A helper function to calculate and store conversation numbers correctly
  const processConversationsWithNumbers = (conversations) => {
    // First sort by created date to ensure consistent numbering
    const sortedByDate = [...conversations].sort(
      (a, b) => new Date(a.startedDate || a.createdAt) - new Date(b.startedDate || b.createdAt)
    );
    
    // Add numbers to each conversation
    const withNumbers = sortedByDate.map((conv, index) => {
      // Use backend sequence number if available, otherwise use index+1
      const number = conv.sequence || index + 1;
      
      // Store in sessionStorage for consistent reference
      sessionStorage.setItem(`conversation_number_${conv.id}`, number);
      
      return {
        ...conv,
        number
      };
    });
    
    // Apply display sorting
    return sortOrder === 'newest' 
      ? [...withNumbers].sort((a, b) => {
          const dateA = new Date(a.startedDate || a.createdAt);
          const dateB = new Date(b.startedDate || b.createdAt);
          return dateB - dateA;
        })
      : withNumbers;
  };

  // Fetch conversations when ticket loads or sort order changes
  useEffect(() => {
    fetchConversations();
  }, [ticket]);
  
  // Loading and error states
  if (isLoading && !ticket) {
    return (
      <ContentContainer>
        <div className="text-center py-10">
          <Text color="text-gray-500">Loading ticket details...</Text>
        </div>
      </ContentContainer>
    );
  }

  if (error && !ticket) {
    return (
      <ContentContainer>
        <div className="text-center py-10">
          <Text color="text-red-500">{error}</Text>          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-bianca-primary text-white rounded hover:bg-bianca-primary/80"
          >
            Try Again
          </button>
        </div>
      </ContentContainer>
    );
  }

  // If no ticket found
  if (!ticket) {
    return (
      <ContentContainer>
        <div className="text-center py-10">
          <Text color="text-red-500">Ticket not found</Text>          <button 
            onClick={() => navigate('/view-tickets')}
            className="mt-4 px-4 py-2 bg-bianca-primary text-white rounded hover:bg-bianca-primary/80"
          >
            Back to Tickets
          </button>
        </div>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <div className="relative mb-5">
        <BackButton onClick={handleBack} className="absolute -top-2 -left-2" />
        <div className="text-center pt-8">
          <PageTitle title="Ticket Details" />
        </div>
      </div>

      {/*Ticket Details Card*/}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        <TicketDetailsCard ticket={ticket} />
        
        <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 mt-6">
          {ticket.status === 'Pending' && (
            <>
              <PrimaryButton onClick={() => setIsEditModalOpen(true)} className="w-full sm:w-32">
                Edit Ticket
              </PrimaryButton>
              <DangerButton onClick={() => setIsCancelModalOpen(true)} className="w-full sm:w-32">
                Cancel Ticket
              </DangerButton>
            </>
          )}
        </div>
        
        {ticket.status === 'Cancelled' ? (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <Text color="text-red-800" align="center">
              This ticket has been cancelled and can no longer be modified.
            </Text>
          </div>
        ) : ticket.status !== 'Pending' && (          <div className="mt-4 p-4 bg-bianca-background/30 border border-bianca-primary/30 rounded-md">
            <Text color="text-bianca-primary" align="center">
              This ticket is {ticket.status.toLowerCase()} and can no longer be modified.
            </Text>
          </div>
        )}
        
        <div className="border-b border-gray-200 my-6"></div>
      </div>

      {/*Conversations container*/}
      {ticket.status !== 'Cancelled' ? (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-4">
            <Subheading className="text-blue-800">Conversation</Subheading>
          </div>
          
          {isLoadingConversations ? (
            <div className="text-center py-8">
              <Text color="text-gray-500">Loading conversation history...</Text>
            </div>
          ) : conversationsError ? (
            <div className="text-center py-8">
              <Text color="text-red-500">{conversationsError}</Text>
              <button 
                onClick={fetchConversations}
                className="mt-4 px-4 py-2 bg-bianca-primary text-white rounded hover:bg-bianca-primary/80"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mb-6">
              {sortedConversations.length > 0 ? (
                sortedConversations.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    number={conversation.number}
                    startedDate={conversation.startedDate}
                    endedDate={conversation.endedDate}
                    status={conversation.status}
                    onClick={() => handleConversationClick(conversation.id, conversation.number)}
                  />
                ))
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <Text color="text-gray-500">No conversations available. Please wait for staff to initiate a conversation.</Text>
                  <Text color="text-gray-400" size="sm" className="mt-2">
                    {ticket.status === 'In Progress' ? 
                      'The assigned staff member will start a conversation soon.' : 
                      'A conversation can be started once your ticket is assigned to staff.'}
                  </Text>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mt-6">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <Text color="text-gray-600" align="center">
              No conversation history is available for {ticket.status.toLowerCase()} tickets.
            </Text>
          </div>
        </div>
      )}

      {/*Edit Ticket Modal*/}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Ticket"
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <SecondaryButton onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleEditSubmit} className="w-full sm:w-auto">
              Save Changes
            </PrimaryButton>
          </div>
        }
      >
        <div className="space-y-4">
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
              <option value="General">General</option>
              <option value="IT Support">IT Support</option>
              <option value="Billing">Billing</option>
            </select>
          </div>
        </div>
      </Modal>

      {/*Cancel Ticket Modal*/}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Ticket"
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <SecondaryButton onClick={() => setIsCancelModalOpen(false)} className="w-full sm:w-auto">
              No, Keep Ticket
            </SecondaryButton>
            <DangerButton onClick={handleCancelTicket} className="w-full sm:w-auto">
              Yes, Cancel Ticket
            </DangerButton>
          </div>
        }
      >
        <Text color="text-gray-600">
          Are you sure you want to cancel this ticket? This action cannot be undone.
        </Text>      </Modal>

      {/*Error Modal*/}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        actions={
          <PrimaryButton onClick={() => setShowErrorModal(false)} className="w-full sm:w-auto">
            OK
          </PrimaryButton>
        }
      >
        <Text color="text-gray-600">
          {errorMessage}
        </Text>
      </Modal>
    </ContentContainer>
  );
}

export default TicketDetailsPage;