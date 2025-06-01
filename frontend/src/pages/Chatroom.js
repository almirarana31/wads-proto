import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContentContainer from '../components/ContentContainer';
import ChatBubble from '../components/ChatBubble';
import BackButton from '../components/buttons/BackButton';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { PageTitle, Text } from '../components/text';
import { authService } from '../api/authService';

function Chatroom() {
  // Gets the conversation id from the url || fetches the right chat by ID i think in the real app
  const { ticketId, conversationId } = useParams();
  const navigate = useNavigate();

  // Check if this is a new conversation
  const isNewConversation = conversationId === 'new';
  // State for chat messages and loading/error handling
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(!isNewConversation);
  const [error, setError] = useState(null);
  const [conversationStatus, setConversationStatus] = useState('open');
  const [actualConversationId, setActualConversationId] = useState(isNewConversation ? null : conversationId);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [input, setInput] = useState('');
  const [conversationNumber, setConversationNumber] = useState(null);
  // First, add a state to track if user is staff/admin
  const [isStaff, setIsStaff] = useState(false);

  // ref that scrolls the chat to the bottom after new message
  const chatContainerRef = useRef(null);
  
  // --- IMPORTANTES ---
  // Fetch conversation data when component mounts
  useEffect(() => {
    if (!isNewConversation) {
      // Fetch existing conversation
      fetchConversationData();
      // Get the conversation number
      getConversationNumber();
    }
  }, [conversationId]);

  // When a new conversation is created, update conversation number
  useEffect(() => {
    if (actualConversationId && isNewConversation) {
      // This happens after creating a new conversation
      getConversationNumber();
    }
  }, [actualConversationId]);

  // Track when new conversation has been converted to a real conversation
  useEffect(() => {
    if (isNewConversation && actualConversationId) {
      // Update URL without page reload when a new conversation is created
      window.history.replaceState(null, '', `/chatroom/${ticketId}/${actualConversationId}`);
    }
  }, [isNewConversation, actualConversationId, ticketId]);
  // Function to get the conversation number for display
  const getConversationNumber = async () => {
    // Determine which conversation ID to use (the one from params or newly created)
    const convId = isNewConversation ? actualConversationId : conversationId;
    
    // Skip if we don't have a valid conversation ID yet
    if (!convId) return;
    
    // First try to get from sessionStorage
    const storedNumber = sessionStorage.getItem(`conversation_number_${convId}`);
    
    if (storedNumber) {
      setConversationNumber(storedNumber);
      return;
    }
    
    // If not in sessionStorage, fetch all conversations for the ticket to determine the number
    try {
      // Make sure we're using a raw numeric ID for the API call
      const rawTicketId = ticketId.startsWith('TKT-') ? ticketId.replace('TKT-', '') : ticketId;
      const conversationHistory = await authService.getConversationHistory(rawTicketId);
      
      if (Array.isArray(conversationHistory)) {
        // Find the index of current conversation in the history
        // Sort by creation date to ensure consistent numbering
        const sortedConversations = [...conversationHistory].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        const index = sortedConversations.findIndex(conv => conv.id.toString() === convId.toString());
        
        if (index !== -1) {
          const number = index + 1; // Convert to 1-based index
          setConversationNumber(number);
          // Store for future use
          sessionStorage.setItem(`conversation_number_${convId}`, number);
        }
      }
    } catch (err) {
      console.error('Error determining conversation number:', err);
      // Fallback to using '#' if we can't determine the number
      setConversationNumber('#');
    }
  };
  // Fetch conversation messages from API
  const fetchConversationData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.getConversation(conversationId);
        // Process the response data
      if (response && Array.isArray(response)) {
        // Filter out the closed status object from the messages
        const messages = response.filter(item => !('closed' in item));
        
        // Check if conversation is closed using the new attribute
        const closedItem = response.find(item => item.closed !== undefined);
        if (closedItem && closedItem.closed === true) {
          setConversationStatus('closed');
        }
        
        // Format messages for display
        const formattedMessages = messages.map((msg, index) => {
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const showSender = !prevMsg || prevMsg.sender_id !== msg.sender_id;
          
          return {
            id: msg.id,
            content: msg.content,
            sender: msg.isSender ? 'staff' : 'user', // Adjust based on your UI needs
            senderName: msg.sender_username,
            timestamp: new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            showSender: showSender,
            isSender: msg.isSender
          };
        });
        
        setChatMessages(formattedMessages);
        
        // Update last message ID for polling
        if (formattedMessages.length > 0) {
          setLastMessageId(formattedMessages[formattedMessages.length - 1].id);
        }
        
        // Check for metadata in the response 
        if (response.metadata) {
          // If backend provides sequence number, use it
          if (response.metadata.sequenceNumber) {
            setConversationNumber(response.metadata.sequenceNumber);
            sessionStorage.setItem(`conversation_number_${conversationId}`, response.metadata.sequenceNumber);
          }
          
          // Update conversation status if provided
          if (response.metadata.isOpen !== undefined) {
            setConversationStatus(response.metadata.isOpen ? 'open' : 'closed');
          } else {
            setConversationStatus('open'); // Default to open
          }
        } else {
          // If no metadata, default to open status
          setConversationStatus('open');
        }
      }
    } catch (err) {
      console.error('Error fetching conversation data:', err);
      setError('Failed to load conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleBack = () => {
    navigate(-1);
  };  // Send message state
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  
  // Send message to backend with optimistic update
  const handleSend = async () => {
    if (input.trim() === '') return;
    
    // Store message content for optimistic update/error handling
    const messageContent = input;
    setInput(''); // Clear input immediately for better UX
    
    try {
      setIsSending(true);
      setSendError(null);
      
      // Generate a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Add message to UI immediately (optimistic update)
      const optimisticMessage = {
        id: tempId,
        content: messageContent,
        sender: 'staff', // Assuming staff is sending, adjust based on your app logic
        senderName: 'You', // This would be replaced by actual name from auth context
        timestamp: timestamp,
        showSender: chatMessages.length === 0 || chatMessages[chatMessages.length - 1].sender !== 'staff',
        isSender: true
      };
      
      setChatMessages(prev => [...prev, optimisticMessage]);
        // Create conversation if it's a new one
      if (isNewConversation) {
        // Make sure we're using a raw numeric ID for the API call
        const rawTicketId = ticketId.startsWith('TKT-') ? ticketId.replace('TKT-', '') : ticketId;
        const newConvResponse = await authService.createConversation(rawTicketId);
        
        // Save the newly created conversation ID
        setActualConversationId(newConvResponse.id);
        
        // Send message to the new conversation
        await authService.sendMessage(newConvResponse.id, messageContent);
        
        // We'll let the useEffect handle updating the URL and conversation number
      } else {
        // Send message to existing conversation
        await authService.sendMessage(conversationId, messageContent);
      }
      
      // If successful, we could refresh message list or just keep optimistic update
      // In this case, polling will update anyway, so we don't need to fetch again
      
    } catch (err) {
      console.error('Error sending message:', err);
      setSendError('Failed to send message. Please try again.');
      
      // Remove optimistic message on failure
      setChatMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
      
      // Add the unsent message back to input
      setInput(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  // let user send message with enter key ||real app maybe also handle
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };
  // Poll for new messages
  useEffect(() => {
    // Don't poll if this is a new conversation, no conversation ID, or conversation is closed
    if (isNewConversation || !actualConversationId || conversationStatus === 'closed') return;
    
    const pollForNewMessages = async () => {
      try {
        // In a real implementation, we'd use a specific endpoint to get only new messages
        // For now, we're refetching all messages but would only append new ones
        const response = await authService.getConversation(actualConversationId);
        
        if (response && Array.isArray(response)) {          // Check for closed status in the response
          const closedItem = response.find(item => item.closed !== undefined);
          if (closedItem && closedItem.closed === true) {
            setConversationStatus('closed');
            // Don't continue processing messages if conversation is now closed
            return;
          }
          
          // Filter out any items that are not actual messages
          const messages = response.filter(item => !('closed' in item));
          
          // Check if we have new messages by comparing with lastMessageId
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && (!lastMessageId || lastMessage.id > lastMessageId)) {
            // Format and add only new messages
            const newMessages = messages
              .filter(msg => !lastMessageId || msg.id > lastMessageId)
              .map((msg, index, filteredArray) => {
                const prevMsg = index > 0 ? filteredArray[index - 1] : null;
                const showSender = !prevMsg || prevMsg.sender_id !== msg.sender_id;
                
                return {
                  id: msg.id,
                  content: msg.content,
                  sender: msg.isSender ? 'staff' : 'user',
                  senderName: msg.sender_username,
                  timestamp: new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  showSender: showSender,
                  isSender: msg.isSender
                };
              });
            
            if (newMessages.length > 0) {
              setChatMessages(prev => [...prev, ...newMessages]);
              setLastMessageId(lastMessage.id);
            }
          }
          
          // Check for metadata in the response for potential updates
          if (response.metadata) {
            // If backend provides sequence number, use it
            if (response.metadata.sequenceNumber && !conversationNumber) {
              setConversationNumber(response.metadata.sequenceNumber);
              sessionStorage.setItem(`conversation_number_${actualConversationId}`, response.metadata.sequenceNumber);
            }
            
            // Update conversation status if provided and different from current
            if (response.metadata.isOpen !== undefined) {
              const newStatus = response.metadata.isOpen ? 'open' : 'closed';
              if (newStatus !== conversationStatus) {
                setConversationStatus(newStatus);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error polling for new messages:', err);
        // Don't set error state here to avoid disrupting the UI during polling
      }
    };
    
    // Poll every 10 seconds
    const intervalId = setInterval(pollForNewMessages, 10000);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [actualConversationId, isNewConversation, conversationStatus, lastMessageId, conversationNumber]);  // Function to close a conversation
  const handleCloseConversation = async () => {
    try {
      // Make sure we have a valid conversation ID
      const currentConversationId = isNewConversation ? actualConversationId : conversationId;
      
      if (!currentConversationId) {
        throw new Error('No valid conversation ID found');
      }
      
      // Set closing state for UI feedback
      setIsClosing(true);
      
      console.log(`Closing conversation with ID: ${currentConversationId}`);
      
      // Call the API to close the conversation
      const response = await authService.closeConversation(currentConversationId);
      
      console.log('API response:', response);
      
      // Update local UI state after successful API call
      setConversationStatus('closed');
      
      // Show a success message or notification
      alert('Conversation has been closed successfully.');
      
      // Refresh conversation data to ensure UI is up to date
      if (!isNewConversation) {
        fetchConversationData();
      }
    } catch (err) {
      console.error('Error closing conversation:', err);
      alert('Failed to close conversation. Please try again.');
    } finally {
      setIsClosing(false);
    }
  };

  // Add a function to check user role when component mounts
  useEffect(() => {
    const checkUserRole = async () => {
      try {        const userDetails = await authService.getUserDetail();
        console.log('User details for staff check:', userDetails);
        // Setting isStaff based on role from backend
        setIsStaff(userDetails.role === 'staff' || userDetails.role === 'admin');
      } catch (err) {
        console.error('Error checking user role:', err);
        setIsStaff(false);
      }
    };

    checkUserRole();
  }, []);

  return (
    <ContentContainer>      <div className="relative mb-5">
        <BackButton onClick={handleBack} className="absolute -top-2 -left-2" />        <div className="text-center pt-8">
          {/* Use the conversation number we've determined */}
          <PageTitle title={isNewConversation ? 'New Conversation' : `Conversation ${conversationNumber || '#'}`} />
          
          {/* Display status indicator for closed conversations */}
          {conversationStatus === 'closed' && (
            <div className="inline-flex items-center px-3 py-1 mt-2 bg-gray-100 border border-gray-200 rounded-full text-sm">
              <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
              <span className="text-gray-700">Closed</span>
            </div>
          )}
        </div>
      </div>
      <div className="border-b border-gray-200 my-6"></div>

      {/* Chat content with loading and error states */}
      <div
        ref={chatContainerRef}
        className="flex flex-col gap-2 max-w-2xl mx-auto mt-8 mb-6 h-96 overflow-y-auto p-2"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="ml-3 text-gray-600">Loading conversation...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-red-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <Text color="text-red-500">{error}</Text>
            <PrimaryButton 
              onClick={fetchConversationData} 
              className="mt-3"
            >
              Try Again
            </PrimaryButton>
          </div>
        ) : chatMessages.length > 0 ? (          chatMessages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg.content}
              isSender={msg.isSender}
              senderName={msg.senderName}
              timestamp={msg.timestamp}
              showSender={msg.showSender}
              isClosedConversation={conversationStatus === 'closed'}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <Text color="text-gray-400">
              {isNewConversation ? "Start a new conversation by sending a message." : "No messages in this conversation yet."}
            </Text>
          </div>
        )}
        
        {/* Show sending error if any */}
        {sendError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2 text-center">
            <Text color="text-red-600">{sendError}</Text>
          </div>
        )}
      </div>
        {/* Chat input */}
      <div className="max-w-2xl mx-auto w-full mt-4">
        {conversationStatus === 'open' || isNewConversation ? (
          <>
            <div className="flex bg-white rounded-xl shadow-md border border-gray-200">
              <input
                type="text"
                className="flex-1 px-4 py-3 rounded-l-xl outline-none"
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending}
              />
              <PrimaryButton
                onClick={handleSend}
                aria-label="Send"
                type="button"
                className="px-5 flex items-center justify-center"
                disabled={isSending || input.trim() === ''}
              >
                {isSending ? (
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M5 12l14-7-7 14-2-5-5-2z" />
                  </svg>
                )}
              </PrimaryButton>
            </div>            
            {/* Close conversation button - show if the conversation is open */}
            {conversationStatus === 'open' && (
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleCloseConversation}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center px-3 py-1 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                  disabled={isClosing}
                >
                  {isClosing ? (
                    <>
                      <div className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-red-600 border-r-transparent"></div>
                      Closing...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Close Conversation
                    </>
                  )}
                </button>
              </div>
            )}
          </>        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <Text color="text-gray-700" weight="semibold" size="lg">
                This conversation is closed
              </Text>
            </div>
            <Text color="text-gray-500" size="sm" className="max-w-md mx-auto mb-2">
              This conversation has been marked as completed and can no longer be modified.
              To continue the discussion, please start a new conversation.
            </Text>        
          </div>
        )}
      </div>
    </ContentContainer>
  );
}

export default Chatroom;