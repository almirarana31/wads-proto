// Test script for chatbot functionality
import { sendMessage } from './controllers/chatbot.js';

// Mock request and response objects
const mockReq = {
    body: {
        message: "I need help with a billing issue",
        conversationHistory: []
    },
    user: null // Simulate guest user
};

const mockRes = {
    status: (code) => ({
        json: (data) => {
            console.log(`Status: ${code}`);
            console.log('Response:', JSON.stringify(data, null, 2));
            return mockRes;
        }
    }),
    json: (data) => {
        console.log('Response:', JSON.stringify(data, null, 2));
        return mockRes;
    }
};

// Test the chatbot
console.log('Testing chatbot with guest user...');
sendMessage(mockReq, mockRes).catch(console.error);
