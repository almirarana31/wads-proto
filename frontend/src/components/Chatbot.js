import React, { useState, useEffect, useRef } from 'react'; // Added useEffect, useRef
import { useAuth } from '../context/AuthContext';
import { IoChatbubbleEllipses } from "react-icons/io5";


// Simple Chat Icon (SVG) - You can replace this with a proper icon library if you use one
const ChatIcon = () => (
    <IoChatbubbleEllipses size={24} /> // Added size for better control
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const Chatbot = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [isChatOpen, setIsChatOpen] = useState(false); // State to toggle chat window
    const [messages, setMessages] = useState([]); // State for chat messages
    const [inputValue, setInputValue] = useState(''); // State for input field
    const messagesEndRef = useRef(null); // For auto-scrolling

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (isLoading) {
        // Optionally, render nothing or a loader while auth state is loading
        return null; 
    }

    // Determine who should see the chatbot
    // Guests: !isAuthenticated
    // Customers: isAuthenticated && user.role === 'USR' (Updated to match App.js role)
    const canSeeChatbot = !isAuthenticated || (isAuthenticated && user && user.role === 'USR');

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
    };

    const handleSendMessage = () => {
        if (inputValue.trim() === '') return;

        const newUserMessage = {
            id: Date.now(),
            text: inputValue,
            sender: 'user'
        };

        // Simulate bot response for now
        // In a real app, you would call your backend API here
        const botResponse = {
            id: Date.now() + 1, // Ensure unique ID
            text: `Echo: ${inputValue}`,
            sender: 'bot'
        };

        setMessages(prevMessages => [...prevMessages, newUserMessage, botResponse]);
        setInputValue(''); // Clear input field
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
                    // backgroundColor: '#007bff', // Removed
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
                className="bg-bianca-dark-blue" // Added Tailwind class
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
                    // backgroundColor: '#007bff', // Removed
                    color: 'white',
                    borderTopLeftRadius: '9px',
                    borderTopRightRadius: '9px',
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
                className="bg-bianca-dark-blue" // Added Tailwind class
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
                <div ref={messagesEndRef} /> {/* Element to scroll to */}
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
                    style={{
                        padding: '8px 15px',
                        borderRadius: '20px',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
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
