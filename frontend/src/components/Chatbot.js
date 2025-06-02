import React, { useState, useEffect, useRef } from 'react';
import { IoChatbubbleEllipses } from "react-icons/io5";
import { authService } from '../api/authService';

const ChatIcon = () => (
    <IoChatbubbleEllipses size={24} />
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// Modified to accept props directly from App.js
const Chatbot = ({ isAuthenticated, userRole }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false); // For API call loading state

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Determine who should see the chatbot
    // Guests: !isAuthenticated
    // Customers: isAuthenticated && userRole === 'USR'
    const canSeeChatbot = !isAuthenticated || (isAuthenticated && userRole === 'USR');

    if (!canSeeChatbot) {
        return null; // Don't render the chatbot if the user doesn't have access
    }

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
        if (!isChatOpen && messages.length === 0) {
            // Add a default greeting when chat opens for the first time
            setMessages([
                { id: Date.now(), text: "Hello! How can I help you today?", sender: 'bot' }
            ]);
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };    const handleSendMessage = async () => {
        if (inputValue.trim() === '') return;

        const newUserMessage = {
            id: Date.now(),
            text: inputValue,
            sender: 'user'
        };

        // Add user message immediately
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        setIsLoading(true); // Show loading indicator
        
        const currentInput = inputValue;
        setInputValue(''); // Clear input field immediately

        try {            // Call the chatbot API with conversation history
            const response = await authService.sendChatMessage(currentInput, messages);
            
            if (response.success) {
                const botResponse = {
                    id: Date.now() + 1,
                    text: response.message,
                    sender: 'bot'
                };
                
                setMessages(prevMessages => [...prevMessages, botResponse]);
            } else {
                throw new Error(response.error || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('Chat error:', error);
            
            // Handle different types of errors
            let errorMessage = 'Sorry, I\'m experiencing technical difficulties. Please try again later.';
            
            if (error.response?.status === 429) {
                errorMessage = 'I\'m currently busy helping other customers. Please try again in a moment.';
            } else if (error.response?.status === 401) {
                errorMessage = 'Service temporarily unavailable. Please try again later.';
            }
            
            const errorResponse = {
                id: Date.now() + 1,
                text: errorMessage,
                sender: 'bot'
            };
            
            setMessages(prevMessages => [...prevMessages, errorResponse]);
        } finally {
            setIsLoading(false); // Hide loading indicator
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent new line on Enter
            handleSendMessage();
        }
    };

    if (!isChatOpen) {
        return (
            <button
                onClick={toggleChat}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    color: 'white',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: 'none',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}
                className="bg-bianca-dark-blue"
                aria-label="Open chat"
            >
                <ChatIcon />
            </button>
        );
    }

    // Chat Panel (when isChatOpen is true)
    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '350px',
            height: '500px',
            border: '1px solid #ccc',
            borderRadius: '10px',
            backgroundColor: 'white',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000, 
        }}>
            <div 
                style={{
                    padding: '10px',
                    color: 'white',
                    borderTopLeftRadius: '9px',
                    borderTopRightRadius: '9px',
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
                className="bg-bianca-dark-blue"
            >
                <span>AI Chat Assistant</span>
                <button 
                    onClick={toggleChat} 
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                    aria-label="Close chat"
                >
                    <CloseIcon />
                </button>
            </div>
            <div style={{ flexGrow: 1, padding: '10px', overflowY: 'auto', backgroundColor: '#f9f9f9' }}>
                {messages.map(msg => (
                    <div key={msg.id} style={{
                        marginBottom: '10px',
                        textAlign: msg.sender === 'user' ? 'right' : 'left',
                    }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '8px 12px',
                            borderRadius: '15px',
                            backgroundColor: msg.sender === 'user' ? '#007bff' : '#e9e9eb',
                            color: msg.sender === 'user' ? 'white' : 'black',
                            maxWidth: '70%',
                            wordWrap: 'break-word',
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div style={{
                        textAlign: 'left',
                        marginBottom: '10px'
                    }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '8px 12px',
                            borderRadius: '15px',
                            backgroundColor: '#e9e9eb',
                            maxWidth: '70%',
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '4px',
                            }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#888',
                                    borderRadius: '50%',
                                    animation: 'bounce 1s infinite',
                                }}></div>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#888',
                                    borderRadius: '50%',
                                    animation: 'bounce 1s infinite',
                                    animationDelay: '0.2s',
                                }}></div>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#888',
                                    borderRadius: '50%',
                                    animation: 'bounce 1s infinite',
                                    animationDelay: '0.4s',
                                }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: '10px', borderTop: '1px solid #ccc', display: 'flex', alignItems: 'center' }}>
                <input 
                    type="text" 
                    placeholder="Type your message..." 
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    style={{ 
                        flexGrow: 1, 
                        padding: '8px', 
                        borderRadius: '20px', 
                        border: '1px solid #ddd',
                        marginRight: '8px',
                    }}
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    style={{
                        padding: '8px 15px',
                        borderRadius: '20px',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        opacity: isLoading || !inputValue.trim() ? 0.7 : 1,
                    }}
                    className="bg-bianca-dark-blue"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
