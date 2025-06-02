import express from 'express';
import jwt from 'jsonwebtoken';
import * as chatbotController from '../controllers/chatbot.js';

const router = express.Router();

// Soft authentication middleware for chatbot - allows both authenticated and guest users
const softAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        
        if (token) {
            try {
                const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                req.user = user; // Attach authenticated user
            } catch (err) {
                // Token is invalid, but we'll proceed as guest
                req.user = null;
            }
        } else {
            // No token provided, proceed as guest
            req.user = null;
        }
        
        return next();
    } catch (error) {
        // On any error, proceed as guest
        req.user = null;
        return next();
    }
};

// POST /api/chatbot/message - Allow both authenticated and guest users
router.post('/message', softAuth, chatbotController.sendMessage);

export default router;
