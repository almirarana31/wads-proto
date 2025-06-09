import express from 'express';
import { getConversationHistory, getConversation, sendMessage, createConversation, closeConversation } from '../controllers/conversation.js';
import { authN, userAuthZ, staffAuthZ, conversationAuthZ, ticketAuthZ } from '../middleware/auth.js';

const router = express.Router();

router.use(authN, userAuthZ)

// basic conversation gets and send messages // this is ticket id
router.get('/ticket/:ticketID/history', ticketAuthZ, getConversationHistory)

// this is conversation id
router.get('/:conversationID', getConversation)

// this is conversation id
router.post('/:conversationID/message', conversationAuthZ, sendMessage)

// create conversation // this is ticket id
router.post('/ticket/:ticketID', staffAuthZ, createConversation);

// close conversation // this is conversation id
router.patch('/:conversationID', conversationAuthZ, staffAuthZ, closeConversation); // this

export default router

