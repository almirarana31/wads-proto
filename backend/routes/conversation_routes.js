import express from 'express';
import { getConversationHistory } from '../controllers/conversation.js';
import { authN, userAuthZ, staffAuthZ, conversationAuthZ } from '../middleware/auth.js';

const router = express.Router();

router.use(authN, userAuthZ)

router.get('/history', staffAuthZ, getConversationHistory)

router.get('/:id', conversationAuthZ, )

export default router