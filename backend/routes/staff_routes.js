import express from 'express';
import { getTickets, getSummary, getTicketPool, claimTicket} from '../controllers/staff.js';
import { authN, staffAuthZ } from '../middleware/auth.js';

const router = express.Router();

router.use(authN, staffAuthZ);

router.get('/tickets', getTickets);

router.get('/summary', getSummary);

router.get('/tickets/pool', getTicketPool);

router.patch('/tickets', claimTicket);

export default router;