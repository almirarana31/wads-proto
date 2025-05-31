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

  // ref that scrolls the chat to the bottom after new message
  const chatContainerRef = useRef(null);
  // We'll determine conversation status from the API response
  // For now, we'll assume it's open unless set otherwise
  // --- IMPORTANTES ---
  // Fetch conversation data when component mounts
  useEffect(() => {
    if (!isNewConversation) {
      // Fetch existing conversation
      fetchConversationData();
    }
  }, [conversationId]);

  // Fetch conversation messages from API
  const fetchConversationData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.getConversation(conversationId);
      
      // Process the response data
      if (response && Array.isArray(response)) {
        // Format messages for display
        const formattedMessages = response.map((msg, index) => {
          const prevMsg = index > 0 ? response[index - 1] : null;
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
        
        // Update conversation status if needed
        // This would come from the API in a real implementation
        setConversationStatus('open'); // Default to open, API should provide actual status
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
  };
  // Send message state
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  
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
        const newConvResponse = await authService.createConversation(ticketId);
        // Save the newly created conversation ID
        setActualConversationId(newConvResponse.id);
        
        // Send message to the new conversation
        await authService.sendMessage(newConvResponse.id, messageContent);
        
        // Update URL without reloading the page
        window.history.replaceState(null, '', `/chatroom/${ticketId}/${newConvResponse.id}`);
          // No need to try to modify isNewConversation as it's from useParams
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
        
        if (response && Array.isArray(response)) {
          // Check if we have new messages by comparing with lastMessageId
          const lastMessage = response[response.length - 1];
          
          if (lastMessage && (!lastMessageId || lastMessage.id > lastMessageId)) {
            // Format and add only new messages
            const newMessages = response
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
  }, [actualConversationId, isNewConversation, conversationStatus, lastMessageId]);
  return (
    <ContentContainer>
      <div className="relative mb-5">
        <BackButton onClick={handleBack} className="absolute -top-2 -left-2" />
        <div className="text-center pt-8">
          <PageTitle title={isNewConversation ? 'New Conversation' : `Conversation ${conversationId}`} />
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
        ) : chatMessages.length > 0 ? (
          chatMessages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg.content}
              isSender={msg.isSender}
              senderName={msg.senderName}
              timestamp={msg.timestamp}
              showSender={msg.showSender}
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
        ) : (
          <div className="text-center py-6">
            <Text color="text-gray-500" size="lg" weight="semibold">
              This conversation has ended.
            </Text>
          </div>
        )}
      </div>
    </ContentContainer>
  );
}

export default Chatroom;