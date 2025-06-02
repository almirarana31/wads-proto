import { sendMessage } from './controllers/chatbot.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testCompleteFlow() {
    console.log('Testing complete ticket creation flow with thank you message...\n');
    
    // Simulate conversation history - full ticket creation flow
    let conversationHistory = [];
    
    // Test 1: Initial request
    console.log('=== Step 1: Customer requests help ===');
    let req = {
        body: {
            message: "I need help with a billing issue",
            conversationHistory: conversationHistory
        }
    };
    
    let res = {
        json: (data) => {
            console.log('Bot:', data.message);
            conversationHistory.push(
                { sender: 'user', text: req.body.message },
                { sender: 'bot', text: data.message }
            );
        },
        status: () => ({ json: (data) => console.log('Error:', data) })
    };
    
    await sendMessage(req, res);
    
    // Test 2: Provide email
    console.log('\n=== Step 2: Customer provides email ===');
    req.body.message = "My email is john.doe@example.com";
    req.body.conversationHistory = [...conversationHistory];
    
    await sendMessage(req, res);
    
    // Test 3: Provide more details
    console.log('\n=== Step 3: Customer provides more details ===');
    req.body.message = "I was charged twice for my last appointment on my credit card";
    req.body.conversationHistory = [...conversationHistory];
    
    await sendMessage(req, res);
    
    // Test 4: Confirm ticket creation
    console.log('\n=== Step 4: Customer confirms ticket creation ===');
    req.body.message = "Yes, please create the ticket";
    req.body.conversationHistory = [...conversationHistory];
    
    await sendMessage(req, res);
    
    // Test 5: Say thank you after ticket creation
    console.log('\n=== Step 5: Customer says thank you (should NOT create another ticket) ===');
    req.body.message = "Thank you so much!";
    req.body.conversationHistory = [...conversationHistory];
    
    res.json = (data) => {
        console.log('Bot:', data.message);
        
        // Check if another ticket was created (this should NOT happen)
        if (data.ticketCreated) {
            console.log('\n❌ ERROR: Another ticket was created when customer said thank you!');
        } else {
            console.log('\n✅ SUCCESS: No new ticket created for thank you message');
        }
        
        conversationHistory.push(
            { sender: 'user', text: req.body.message },
            { sender: 'bot', text: data.message }
        );
    };
    
    await sendMessage(req, res);
    
    // Test 6: Ask for help with a NEW issue
    console.log('\n=== Step 6: Customer asks for help with a NEW issue ===');
    req.body.message = "Actually, I have another issue with scheduling an appointment";
    req.body.conversationHistory = [...conversationHistory];
    
    res.json = (data) => {
        console.log('Bot:', data.message);
        console.log('\n✅ This should start collecting info for a NEW ticket');
    };
    
    await sendMessage(req, res);
}

// Run the test
testCompleteFlow().catch(console.error);
