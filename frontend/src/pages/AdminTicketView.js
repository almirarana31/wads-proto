import React, { useState, useEffect } from 'react'; // useMemo is unused
import { useParams, useNavigate } from 'react-router-dom';
import ContentContainer from '../components/ContentContainer';
import TicketDetailsCard from '../components/TicketDetailsCard';
import ConversationCard from '../components/ConversationCard';
import BackButton from '../components/buttons/BackButton';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { PageTitle, Text, Subheading, Label } from '../components/text';
import { authService } from '../api/authService';

function AdminTicketView() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');
  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

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
        // Use 'newest' directly instead of sortOrder variable
        const conversationHistory = await authService.getConversationHistory(rawTicketId, 'newest');
        
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
        
        const numberedConversations = processConversationsWithNumbers(formattedConversations);
        
        setConversations(numberedConversations);
      } catch (err) {
        console.error('Error fetching conversations:', err);
      } finally {
        setIsLoadingConversations(false);
      }
    };
    
    if (ticket && ticket.status !== 'Cancelled') {
      fetchConversations();
    }
  }, [ticket, ticketId]);
  
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
      return { 
        ...conv,
        number,
        status: conv.status || 'open' // Preserve status
      };
    });
    
    return withNumbers;
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

            {/*Note Section*/}
            <div className="mt-6">
              <Label className="mb-1">Internal Note</Label>
              {ticket.note ? (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-700 min-h-[80px]">
                  {ticket.note}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-400 italic min-h-[80px]">
                  No notes have been added to this ticket yet.
                </div>
              )}
              <Text color="text-gray-500 text-xs mt-1">
                Notes can only be added by staff assigned to this ticket.
              </Text>
            </div>

            {/*Customer Information*/}
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

            {/*Conversations Section*/}
            {ticket.status !== 'Cancelled' && (
              <div className="mt-8">
                <div className="mb-4">
                  <Subheading className="text-blue-800">Conversation</Subheading>
                </div>

                {isLoadingConversations ? (
                  <div className="text-center py-8">
                    <Text>Loading conversations...</Text>
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
