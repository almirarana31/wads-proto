import express from 'express';
import { getTickets, getSummary, getTicketPool, claimTicket, resolveTicket, cancelTicket } from '../controllers/staff.js';
import { authN, staffAuthZ } from '../middleware/auth.js';

const router = express.Router();

router.use(authN, staffAuthZ);

router.get('/tickets', getTickets);
router.get('/summary', getSummary);
router.patch('/tickets/:id/resolve', resolveTicket);
router.patch('/tickets/:id/cancel', cancelTicket);
router.get('/tickets/pool', getTicketPool);
router.patch('/tickets', claimTicket);

export default router;