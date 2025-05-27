import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContentContainer from '../components/ContentContainer';
import ChatBubble from '../components/ChatBubble';
import BackButton from '../components/buttons/BackButton';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { PageTitle, Text } from '../components/text';

function Chatroom() {
  // Gets the conversation id from the url || fetches the right chat by ID i think in the real app
  const { conversationId } = useParams();
  const navigate = useNavigate();

  // dummy data for now || fullstack version will fetch from the backend api
  const [chatMessages, setChatMessages] = useState([
    { sender: 'staff', content: "Hello, I'm Staff here to help. Could you explain the details of your issue?", timestamp: '09:00 AM', showSender: true },
    { sender: 'user', content: 'Yes, when I tried to pay, it said "Payment Failed" even though I did all the cocorect steps.', timestamp: '09:01 AM', showSender: true },
    { sender: 'user', content: '*correct. Sorry for the typo.', timestamp: '09:02 AM', showSender: false },
    { sender: 'staff', content: 'The issue has been solved, I will close this conversation.', timestamp: '09:02 AM', showSender: true }
  ]);
  const [input, setInput] = useState('');

  // ref that scrolls the chat to the bottom after new message
  const chatContainerRef = useRef(null);

  // --- IMPORTANTES: Only frontend demo, REMOVE this logic when implementing the fullstack ---
  // conversationId is '1' is closed for demo purposes. In real app, get this from backend!!!
  const ticketStatus = conversationId === '1' ? 'closed' : 'open';
  // --- IMPORTANTES ---

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleBack = () => {
    navigate(-1);
  };

  // this will add the new message to the chat, in fullstack version this should also send to backend
  const handleSend = () => {
    if (input.trim() === '') return;
    const now = new Date();
    // Real app should use server time for consistency
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => {
      const newMessages = [
        ...prev,
        {
          sender: 'user',
          content: input,
          timestamp,
          showSender: prev.length === 0 || prev[prev.length - 1].sender !== 'user'
        }
      ];
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 0);
      return newMessages;
    });
    setInput('');
  };

  // let user send message with enter key ||real app maybe also handle
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <ContentContainer>      <div className="relative mb-5">
        <BackButton onClick={handleBack} className="absolute -top-2 -left-2" />
        <div className="text-center pt-8">
          {/* in fullstack, this title could show the other chat title */}
          <PageTitle title={`Conversation ${conversationId}`} />
        </div>
      </div>
      <div className="border-b border-gray-200 my-6"></div>
      {/* Chat content || fullstack should auto update when new messages come from server */}
      <div
        ref={chatContainerRef}
        className="flex flex-col gap-2 max-w-2xl mx-auto mt-8 mb-6 h-96 overflow-y-auto"
      >
        {chatMessages.map((msg, idx) => (
          <ChatBubble
            key={idx}
            message={msg.content}
            sender={msg.sender}
            timestamp={msg.timestamp}
            showSender={msg.showSender}
          />
        ))}
      </div>
      {/* chat input || fullstack, sending should update backend and maybe disable while loading || also considering turning this into a component*/}
      <div className="max-w-2xl mx-auto w-full mt-4">
        {ticketStatus === 'open' ? (
          <div className="flex bg-white rounded-xl shadow-md border border-gray-200">
            <input
              type="text"
              className="flex-1 px-4 py-3 rounded-l-xl outline-none"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <PrimaryButton
              onClick={handleSend}
              aria-label="Send"
              type="button"
              className="px-5 flex items-center justify-center"
            >
              {/* in real app, maybe show loading spinner if sending */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M5 12l14-7-7 14-2-5-5-2z" />
              </svg>
            </PrimaryButton>
          </div>        ) : (
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