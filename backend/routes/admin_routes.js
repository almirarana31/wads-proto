import express from 'express';
import { getStatusSummary, getTickets, getAdminUsername } from '../controllers/admin.js';
import { authN, adminAuthZ } from '../middleware/auth.js';

const router = express.Router();

// add middleware 

router.use(authN, adminAuthZ);

router.get('/get-status-summary', getStatusSummary);

router.get('/get-username/:id', getAdminUsername);

router.get('/get-tickets', getTickets);

export default router;