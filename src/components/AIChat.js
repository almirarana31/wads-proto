import React, { useState, useEffect } from 'react';
import './AIChat.css';

const AIChat = ({ isOpen }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    setMessages([
      {
        sender: 'bot',
        text: "Hello! I'm Bianca's AI assistant. How can I help you today?",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  const handleSend = () => {
    if (input.trim() === '') return;

    const userMessage = {
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages([...messages, userMessage]);
    setInput('');

    setTimeout(() => {
      let botResponse;
      const lowerInput = input.toLowerCase();

      if (lowerInput.includes('appointment') || lowerInput.includes('schedule')) {
        botResponse = 'To schedule an appointment, please submit a ticket under "Scheduling" or call (555) 123-4567.';
      } else if (lowerInput.includes('payment') || lowerInput.includes('bill')) {
        botResponse = 'For billing inquiries, submit a "Billing" ticket.';
      } else if (lowerInput.includes('treatment') || lowerInput.includes('procedure')) {
        botResponse = 'For treatment questions, consult your specialist or submit a "Treatment" ticket.';
      } else {
        botResponse = 'I\'m not sure. Could you provide more details or submit a ticket?';
      }

      setMessages([...messages, userMessage, { sender: 'bot', text: botResponse, timestamp: new Date().toLocaleTimeString() }]);
    }, 1000);
  };

  return (
    <div className={`ai-chat-container ${isOpen ? 'open' : ''}`}>
      <div className="chat-header">
        <h3 style={{color:"white"}}>AI Assistant</h3>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-content">
              <p>{msg.text}</p>
              <span className="timestamp">{msg.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default AIChat;
