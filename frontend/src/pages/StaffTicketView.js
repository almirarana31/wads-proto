import React, { useState, useEffect, useMemo } from 'react';
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
import { authService } from '../api/authService';

function StaffTicketView() {  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [note, setNote] = useState('');
  const [isNoteSaved, setIsNoteSaved] = useState(false);
    // Fetch ticket details from API
  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        setIsLoading(true);
        // Remove 'TKT-' prefix if present in the ticketId
        const rawTicketId = ticketId.startsWith('TKT-') ? ticketId.replace('TKT-', '') : ticketId;
        const response = await authService.getTicketDetail(rawTicketId);
        
        // Format the ticket data to match our component needs
        const formattedTicket = {
          id: `TKT-${response.id.toString().padStart(3, '0')}`,
          title: response.subject,
          description: response.description,
          status: response.Status?.name || 'In Progress',
          category: response.Category?.name || 'General',
          created: response.createdAt,
          priority: response.Priority?.name || 'Medium',
          note: response.note || '',
          resolvedAt: response.resolved_at || null,
          customer: {
            name: response.User?.username || 'Unknown',
            accountType: response.User?.role || 'Registered',
            email: response.User?.email || 'No email provided'
          }
        };
        
        setTicket(formattedTicket);
        setNote(formattedTicket.note || '');
        setError(null);
      } catch (err) {
        console.error('Error fetching ticket details:', err);
        setError('Failed to load ticket details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (ticketId) {
      fetchTicketDetails();
    }
  }, [ticketId]);
  // Fetch conversations from API
  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [conversationsError, setConversationsError] = useState(null);
  
  // Fetch conversations when ticket is loaded
  useEffect(() => {
    const fetchConversations = async () => {
      if (!ticket) return;
      
      try {
        setIsLoadingConversations(true);
        const rawTicketId = ticketId.startsWith('TKT-') ? ticketId.replace('TKT-', '') : ticketId;
        const conversationHistory = await authService.getConversationHistory(rawTicketId, 'newest');
        
        // Format conversation data
        const formattedConversations = conversationHistory.map(conv => ({
          id: conv.id,
          startedDate: conv.createdAt,
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
        
        // Process and number conversations
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
    
    // Removed condition that prevented fetching for cancelled tickets
    if (ticket) {
      fetchConversations();
    }
  }, [ticket, ticketId]);
  
  // Re-sort conversations when sortOrder changes
  useEffect(() => {
    if (conversations.length > 0) {
      const sortedConversations = [...conversations].sort((a, b) => {
        const dateA = new Date(a.startedDate);
        const dateB = new Date(b.startedDate);
        return 'newest' === 'newest' ? dateB - dateA : dateA - dateB;
      });
      
      setConversations(sortedConversations);
    }
  }, []);
  const handleBack = () => {
  const path = window.location.pathname;
  if (path.includes('/staff/')) {
    navigate('/staff-dashboard');
  } else {
    navigate('/view-tickets');
  }
};  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [createConversationError, setCreateConversationError] = useState(null);
    const handleStartConversation = async () => {
    try {
      setIsCreatingConversation(true);
      setCreateConversationError(null);
      
      // Remove 'TKT-' prefix if present in the ticketId
      const rawTicketId = ticketId.startsWith('TKT-') ? ticketId.replace('TKT-', '') : ticketId;
        // Create a new conversation
      const response = await authService.createConversation(rawTicketId);
      
      console.log('Create conversation response:', response); // Debug log
      
      if (response && response.id) {
        navigate(`/chatroom/${ticketId}/${response.id}`);
      } else {
        // Provide more specific error based on response
        if (response && response.message) {
          throw new Error(`Server message: ${response.message}`);
        } else {
          throw new Error('Failed to create conversation: missing conversation ID in response');
        }
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
      setCreateConversationError('Failed to create conversation. Please try again.');
    } finally {
      setIsCreatingConversation(false);
    }
  };  const handleConversationClick = (conversationId, conversationNumber) => {
    sessionStorage.setItem(`conversation_number_${conversationId}`, conversationNumber);
    navigate(`/chatroom/${ticketId}/${conversationId}`);
  };
  const handleResolveTicket = () => {
    setIsResolveModalOpen(true);
  };
  
  const handleCancelTicket = () => {
    setIsCancelModalOpen(true);
  };  const [resolveError, setResolveError] = useState(null);
  const [isResolvingTicket, setIsResolvingTicket] = useState(false);
  
  const confirmResolveTicket = async () => {
    try {
      setIsResolvingTicket(true);
      setResolveError(null);
      
      // Remove 'TKT-' prefix if present in the ticketId
      const rawTicketId = ticketId.startsWith('TKT-') ? ticketId.replace('TKT-', '') : ticketId;
      
      // Call API to resolve the ticket
      const response = await authService.staffResolveTicket(rawTicketId);
      
      if (response && response.success) {
        // Update the ticket status to 'Resolved'
        setTicket(prevTicket => ({
          ...prevTicket,
          status: 'Resolved',
          resolvedAt: response.ticket.resolved_at || new Date().toISOString()
        }));
        setIsResolveModalOpen(false);
      } else {
        const errorMessage = response?.message || 'Failed to resolve ticket. Please try again.';
        console.error('Failed to resolve ticket:', errorMessage);
        setResolveError(errorMessage);
      }
    } catch (err) {
      console.error('Error resolving ticket:', err);
      setResolveError('Network error while resolving ticket. Please check your connection and try again.');
    } finally {
      setIsResolvingTicket(false);
    }
  };
    const confirmCancelTicket = async () => {
    // Only allow cancellation of 'In Progress' tickets, not Resolved tickets
    if (ticket?.status !== 'In Progress') {
      setIsCancelModalOpen(false);
      return;
    }
    
    try {
      // Remove 'TKT-' prefix if present in the ticketId
      const rawTicketId = ticketId.startsWith('TKT-') ? ticketId.replace('TKT-', '') : ticketId;
      
      // call API to cancel ticket
      const response = await authService.staffCancelTicket(rawTicketId);
      
      if (response && response.success) {
        setTicket(prevTicket => ({
          ...prevTicket,
          status: 'Cancelled',
          cancelledAt: new Date().toISOString()
        }));
      } else {
        console.error('Failed to cancel ticket:', response?.message || 'Unknown error');  
      }
    } catch (err) {
      console.error('Error cancelling ticket:', err);
    } finally {
      setIsCancelModalOpen(false);
    }
  };
  // only allow editing note if ticket is in progress and user is owner/assigned staff
  const canEditNote = ticket?.status === 'In Progress';

  const handleNoteChange = (e) => {
    setNote(e.target.value);
    setIsNoteSaved(false);
  };  const [noteError, setNoteError] = useState(null);
  const [noteSaving, setNoteSaving] = useState(false);

  const handleSaveNote = async () => {
    try {
      setNoteSaving(true);
      setNoteError(null);
      
      // remove 'TKT-' prefix if present in the ticketId
      const rawTicketId = ticketId.startsWith('TKT-') ? ticketId.replace('TKT-', '') : ticketId;
      
      // call API to update the ticket note
      const response = await authService.updateTicketNote(rawTicketId, note);
      
      // check for successs in repsonse
      if (response && (response.success || response.message === "Note successfully added")) {
        // update local state with note
        setTicket(prevTicket => ({ ...prevTicket, note }));
        setIsNoteSaved(true);
        setNoteError(null);
      } else {
        const errorMessage = response?.message || 'Failed to save note. Please try again.';
        console.error('Failed to save note:', errorMessage);
        setNoteError(errorMessage);
        setIsNoteSaved(false);
      }
    } catch (err) {
      console.error('Error saving note:', err);
      setNoteError('Network error while saving note. Please check your connection and try again.');
      setIsNoteSaved(false);
    } finally {
      setNoteSaving(false);
    }
  };
  const handleRetry = () => {
    // Clear errors and reload data
    setError(null);
    setIsLoading(true);
    
    // Remove 'TKT-' prefix if present in the ticketId
    const rawTicketId = ticketId.startsWith('TKT-') ? ticketId.replace('TKT-', '') : ticketId;
    
    // Fetch the ticket data again
    authService.getTicketDetail(rawTicketId)
      .then(response => {
        const formattedTicket = {
          id: `TKT-${response.id.toString().padStart(3, '0')}`,
          title: response.subject,
          description: response.description,
          status: response.Status?.name || 'In Progress',
          category: response.Category?.name || 'General',
          created: response.createdAt,
          priority: response.Priority?.name || 'Medium',
          note: response.note || '',
          resolvedAt: response.resolved_at || null,
          customer: {
            name: response.User?.username || 'Unknown',
            accountType: response.User?.role || 'Registered',
            email: response.User?.email || 'No email provided'
          }
        };
        
        setTicket(formattedTicket);
        setNote(formattedTicket.note || '');
        setError(null);
      })
      .catch(err => {
        console.error('Error retrying ticket fetch:', err);
        setError('Failed to load ticket details. Please try again later.');
      })
      .finally(() => {
        setIsLoading(false);
      });
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
    return 'newest' 
      ? [...withNumbers].sort((a, b) => {
          const dateA = new Date(a.startedDate || a.createdAt);
          const dateB = new Date(b.startedDate || b.createdAt);
          return dateB - dateA;
        })
      : withNumbers;
  };
  return (
    <ContentContainer>
      <div className="relative mb-5">
        <BackButton onClick={handleBack} className="absolute -top-2 -left-2" />
        <div className="text-center pt-8">
          <PageTitle title="Ticket Detail" />
        </div>
      </div>
      
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-bianca-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600">Loading ticket details...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <div className="text-red-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <Text color="text-red-600" className="font-medium text-lg mb-2">Error Loading Ticket</Text>
            <Text color="text-gray-600" className="mb-4">{error}</Text>
            <PrimaryButton onClick={handleRetry}>Try Again</PrimaryButton>
          </div>
        ) : ticket ? (
          <>
            <TicketDetailsCard ticket={ticket} />
            
            {/*Staff Actions*/}
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
            </div>
            
            {/*Notes*/}
            <div className="mt-6">
              <Label className="mb-1">Internal Note (visible to staff & admin only)</Label>
              {canEditNote ? (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-2 items-start">
                    <textarea
                      value={note}
                      onChange={handleNoteChange}
                      rows={2}
                      className={`w-full p-2 border ${
                        isNoteSaved ? 'border-green-300' : 
                        noteError ? 'border-red-300' : 
                        'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-bianca-primary/30`}
                      placeholder="Add a note for this ticket..."
                      maxLength={120}
                      disabled={noteSaving}
                    />
                    <PrimaryButton 
                      onClick={handleSaveNote} 
                      disabled={isNoteSaved || note.trim() === '' || noteSaving}
                      className={noteSaving ? 'opacity-70' : ''}
                    >
                      {noteSaving ? (
                        <span className="flex items-center gap-2">
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                          Saving...
                        </span>
                      ) : isNoteSaved ? 'Saved' : 'Save Note'}
                    </PrimaryButton>
                  </div>
                  {noteError && (
                    <div className="text-red-600 text-sm">
                      {noteError}
                    </div>
                  )}
                  {isNoteSaved && !noteError && (
                    <div className="text-green-600 text-sm">
                      Note saved successfully!
                    </div>
                  )}
                </div>
              ) : (
                note ? (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-700 min-h-[80px]">
                    {note}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-400 italic min-h-[80px]">
                    No notes have been added to this ticket yet.
                  </div>
                )
              )}
            </div>
            
            {/*Customer Info*/}
            <div className="mt-8">
              <Subheading className="text-bianca-primary">Customer Information</Subheading>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Text className="mb-2" color="text-gray-600">Name: <span className="font-medium text-gray-800 break-words">{ticket.customer.name}</span></Text>
                    <Text className="mb-2" color="text-gray-600">Account: <span className="font-medium text-gray-800 break-words">{ticket.customer.accountType}</span></Text>
                  </div>
                  <div>
                    <Text className="mb-2" color="text-gray-600">Email: <span className="font-medium text-gray-800 break-words">{ticket.customer.email}</span></Text>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Conversation Container */}
            {ticket ? (
              <div className="mt-8">
                <div className="mb-4">
                  <Subheading className="text-bianca-primary">Conversation</Subheading>
                </div>
                
                {isLoadingConversations ? (
                  <div className="text-center py-6">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-bianca-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-2 text-gray-600">Loading conversations...</p>
                  </div>
                ) : conversationsError ? (
                  <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-6">
                    <Text color="text-red-600" align="center">{conversationsError}</Text>
                  </div>
                ) : conversations.length > 0 ? (
                  <div className="flex flex-col gap-4 mb-6">
                    {conversations.map((conversation) => (
                      <ConversationCard
                        key={conversation.id}
                        number={conversation.number}
                        startedDate={conversation.startedDate}
                        endedDate={conversation.endedDate}
                        status={conversation.status}
                        onClick={() => handleConversationClick(conversation.id, conversation.number)}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
                      <Text color="text-gray-600" align="center">No conversations found for this ticket.</Text>
                    </div>
                    
                    {createConversationError && (
                      <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
                        <Text color="text-red-600" align="center">{createConversationError}</Text>
                      </div>
                    )}
                    
                    {/*Only show "Start a New Conversation" button if ticket is In Progress AND there are no existing conversations*/}
                    {ticket.status === "In Progress" && (
                      <PrimaryButton 
                        onClick={handleStartConversation} 
                        fullWidth
                        disabled={isCreatingConversation}
                      >
                        {isCreatingConversation ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                            Creating Conversation...
                          </span>
                        ) : (
                          'Start a New Conversation'
                        )}
                      </PrimaryButton>
                    )}
                  </>
                )}
                
                {/*Show error outside the conditional rendering for conversations*/}
                {conversations.length > 0 && createConversationError && (
                  <div className="bg-red-50 p-4 rounded-md border border-red-200 mt-4">
                    <Text color="text-red-600" align="center">{createConversationError}</Text>
                  </div>
                )}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
      {/*Resolve Ticket Modal*/}
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
        {ticket && (
          <>
            <Text>
              Are you sure you want to resolve ticket <strong>{ticket.id}</strong>: "{ticket.title}"?
            </Text>
            <Text color="text-green-600" className="mt-2">
              This will mark the ticket as resolved and the customer will be notified.
            </Text>
          </>
        )}
      </Modal>
      
      {/*Cancel Ticket Modal*/}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Ticket"
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <SecondaryButton key="cancel" onClick={() => setIsCancelModalOpen(false)} className="w-full sm:w-auto">
              Keep Ticket
            </SecondaryButton>
            <DangerButton 
              key="confirm" 
              onClick={confirmCancelTicket} 
              className="w-full sm:w-auto"
              disabled={ticket?.status !== 'In Progress'}
            >
              Cancel Ticket
            </DangerButton>
          </div>
        }
      >
        {ticket && ticket.status === 'In Progress' ? (
          <>
            <Text>
              Are you sure you want to cancel ticket <strong>{ticket.id}</strong>: "{ticket.title}"?
            </Text>
            <Text color="text-red-600" className="mt-2">
              This action cannot be undone. The ticket will be marked as cancelled and the customer will be notified.
            </Text>
          </>
        ) : (
          <Text color="text-red-600">
            Only tickets with "In Progress" status can be cancelled. Resolved tickets cannot be cancelled.
          </Text>
        )}
      </Modal>
    </ContentContainer>
  );
}

export default StaffTicketView;