import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt for the chatbot to understand its role
const SYSTEM_PROMPT = `You are a helpful AI assistant for Bianca Aesthetic Clinic's customer service chatbot. 

Your role is to:
- Assist customers with general inquiries about aesthetic treatments and services
- Help with appointment scheduling and booking questions
- Provide information about clinic policies and procedures
- Answer questions about treatment preparation and aftercare
- Guide users through the ticketing system for support requests
- Maintain a professional, friendly, and empathetic tone

Important guidelines:
- Always be helpful and professional
- If you cannot answer a medical question, advise the customer to consult with a qualified medical professional
- For complex issues or specific medical concerns, suggest they submit a support ticket or contact the clinic directly
- Do not provide specific medical advice or diagnoses
- Keep responses concise but informative
- If asked about pricing, suggest they contact the clinic for current rates as prices may vary

Remember: You represent Bianca Aesthetic Clinic, so maintain the clinic's professional image while being warm and approachable.`;

const sendMessage = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                error: 'Message is required' 
            });
        }

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ 
                success: false, 
                error: 'Gemini API key not configured' 
            });
        }

        // Get the generative model (using Gemini 2.0 Flash)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-exp",
            systemInstruction: SYSTEM_PROMPT
        });

        // Prepare conversation history for context
        let conversationContext = '';
        if (conversationHistory && conversationHistory.length > 0) {
            conversationContext = conversationHistory
                .slice(-10) // Keep last 10 messages for context
                .map(msg => `${msg.sender === 'user' ? 'Customer' : 'Assistant'}: ${msg.text}`)
                .join('\n');
            conversationContext += '\n';
        }

        // Combine context with current message
        const fullPrompt = conversationContext + `Customer: ${message}`;

        // Generate response
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const botReply = response.text();

        res.json({
            success: true,
            message: botReply,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        
        // Handle specific API errors
        if (error.message.includes('API_KEY_INVALID')) {
            return res.status(401).json({
                success: false,
                error: 'Invalid API key configuration'
            });
        }
        
        if (error.message.includes('QUOTA_EXCEEDED')) {
            return res.status(429).json({
                success: false,
                error: 'API quota exceeded. Please try again later.'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Sorry, I\'m experiencing technical difficulties. Please try again later.'
        });
    }
};

export {
    sendMessage
};
