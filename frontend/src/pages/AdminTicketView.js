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

function AdminTicketView() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const [noteError, setNoteError] = useState(null);
  const [noteSaving, setNoteSaving] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [conversationsError, setConversationsError] = useState(null);

  // Fetch ticket details
  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        setIsLoading(true);
        const rawTicketId = ticketId.startsWith('TKT-') ? ticketId.replace('TKT-', '') : ticketId;
        const response = await authService.getTicketDetail(rawTicketId);
        
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

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!ticket) return;
      
      try {
        setIsLoadingConversations(true);
        const rawTicketId = ticketId.startsWith('TKT-') ? ticketId.replace('TKT-', '') : ticketId;
        const conversationHistory = await authService.getConversationHistory(rawTicketId, sortOrder);
        
        const formattedConversations = conversationHistory.map(conv => ({
          id: conv.id,
          startedDate: conv.createdAt,
          endedDate: conv.endedAt || null,
          messages: conv.Messages?.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender_type,
            senderName: msg.sender_name,
            timestamp: new Date(msg.createdAt).toLocaleString()
          })) || []
        }));
        
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
    
    if (ticket && ticket.status !== 'Cancelled') {
      fetchConversations();
    }
  }, [ticket, ticketId, sortOrder]);

  // Handle back button
  const handleBack = () => {
    navigate('/admin-dashboard');
  };

  // Handle conversation click
  const handleViewConversation = (conversationId, conversationNumber) => {
    sessionStorage.setItem(`conversation_number_${conversationId}`, conversationNumber);
    navigate(`/chatroom/${ticketId}/${conversationId}`);
  };

  // Process conversations with numbers
  const processConversationsWithNumbers = (conversations) => {
    const sortedByDate = [...conversations].sort(
      (a, b) => new Date(a.startedDate || a.createdAt) - new Date(b.startedDate || b.createdAt)
    );
    
    const withNumbers = sortedByDate.map((conv, index) => {
      const number = conv.sequence || index + 1;
      sessionStorage.setItem(`conversation_number_${conv.id}`, number);
      return { ...conv, number };
    });
    
    return sortOrder === 'newest' 
      ? [...withNumbers].sort((a, b) => new Date(b.startedDate) - new Date(a.startedDate))
      : withNumbers;
  };

  // Handle note changes
  const handleNoteChange = (e) => {
    setNote(e.target.value);
    setIsNoteSaved(false);
  };

  // Save note
  const handleSaveNote = async () => {
    try {
      setNoteSaving(true);
      setNoteError(null);
      
      const rawTicketId = ticketId.startsWith('TKT-') ? ticketId.replace('TKT-', '') : ticketId;
      const response = await authService.updateTicketNote(rawTicketId, note);
      
      if (response && response.success) {
        setTicket(prevTicket => ({ ...prevTicket, note }));
        setIsNoteSaved(true);
      } else {
        setNoteError(response?.message || 'Failed to save note');
      }
    } catch (err) {
      console.error('Error saving note:', err);
      setNoteError('Failed to save note. Please try again.');
    } finally {
      setNoteSaving(false);
    }
  };

  return (
    <ContentContainer>
      <div className="relative mb-5">
        <BackButton onClick={handleBack} className="absolute -top-2 -left-2" />
        <div className="text-center pt-8">
          <PageTitle title="Ticket Details" />
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-bianca-primary border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading ticket details...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <Text color="text-red-600">{error}</Text>
            <PrimaryButton onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </PrimaryButton>
          </div>
        ) : ticket ? (
          <>
            <TicketDetailsCard ticket={ticket} />

            {/* Note Section */}
            <div className="mt-6">
              <Label className="mb-1">Internal Note (Admin & Staff Only)</Label>
              <div className="flex flex-col gap-2">
                <textarea
                  value={note}
                  onChange={handleNoteChange}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Add an internal note..."
                />
                <div className="flex justify-end">
                  <PrimaryButton
                    onClick={handleSaveNote}
                    disabled={noteSaving || isNoteSaved}
                  >
                    {noteSaving ? 'Saving...' : isNoteSaved ? 'Saved' : 'Save Note'}
                  </PrimaryButton>
                </div>
                {noteError && <Text color="text-red-600">{noteError}</Text>}
              </div>
            </div>

            {/* Customer Information */}
            <div className="mt-8">
              <Subheading className="text-blue-800">Customer Information</Subheading>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Text className="text-gray-600">Name: {ticket.customer.name}</Text>
                    <Text className="text-gray-600">Email: {ticket.customer.email}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-600">Account Type: {ticket.customer.accountType}</Text>
                    <Text className="text-gray-600">Created: {new Date(ticket.created).toLocaleString()}</Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversations Section */}
            {ticket.status !== 'Cancelled' && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <Subheading className="text-blue-800">Conversations</Subheading>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </div>

                {isLoadingConversations ? (
                  <div className="text-center py-8">
                    <Text>Loading conversations...</Text>
                  </div>
                ) : conversations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {conversations.map((conversation) => (
                      <ConversationCard
                        key={conversation.id}
                        number={conversation.number}
                        startedDate={conversation.startedDate}
                        endedDate={conversation.endedDate}
                        onClick={() => handleViewConversation(conversation.id, conversation.number)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Text color="text-gray-500">No conversations available</Text>
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}
      </div>
    </ContentContainer>
  );
}

export default AdminTicketView;
