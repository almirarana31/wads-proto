import express from 'express';
import { getConversationHistory, getConversation, sendMessage, createConversation, closeConversation } from '../controllers/conversation.js';
import { authN, userAuthZ, staffAuthZ, conversationAuthZ } from '../middleware/auth.js';

const router = express.Router();

router.use(authN, userAuthZ)

// basic conversation gets and send messages // this is ticket id
router.get('/:id/history', staffAuthZ, getConversationHistory)

// this is conversation id
router.get('/:id', conversationAuthZ, getConversation)

// this is conversation id
router.post('/:id/message', conversationAuthZ, sendMessage)

// create conversation // this is ticket id
router.post('/:id', staffAuthZ, createConversation);

// close conversation // this is conversation id
router.patch('/:id', conversationAuthZ, staffAuthZ, closeConversation);

export default router