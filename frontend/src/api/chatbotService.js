import axios from './axios';

const chatbotService = {
    // Send message to chatbot and get AI response
    sendMessage: async (message, conversationHistory = []) => {
        try {
            const response = await axios.post('/chatbot/message', {
                message,
                conversationHistory
            });
            return response.data;
        } catch (error) {
            console.error('Chatbot service error:', error);
            throw error;
        }
    }
};

export default chatbotService;
