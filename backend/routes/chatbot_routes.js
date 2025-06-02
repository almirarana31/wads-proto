import express from 'express';
import * as chatbotController from '../controllers/chatbot.js';

const router = express.Router();

// POST /api/chatbot/message
router.post('/message', chatbotController.sendMessage);

export default router;
