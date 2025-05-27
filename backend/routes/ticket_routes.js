import express from 'express';
import { getCategory, getPriority, getStatus, getTicketDetail} from '../controllers/ticket.js';
import { authN, adminAuthZ, staffAuthZ, softAuthZ } from '../middleware/auth.js';

const router = express.Router();

// fetching available options for each fields
router.get('/categories', getCategory);
router.get('/priorities', staffAuthZ, getPriority);
router.get('/statuses', getStatus);
router.get('/tickets/:id', softAuthZ, getTicketDetail);

export default router;