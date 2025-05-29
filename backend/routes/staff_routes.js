import express from 'express';
<<<<<<< HEAD
import { getTickets, getSummary, getTicketPool, claimTicket} from '../controllers/staff.js';
=======
import { getTickets, getSummary, resolveTicket } from '../controllers/staff.js';
>>>>>>> ee93c96f204cce8f5e84d6b08387517f20eb6b9e
import { authN, staffAuthZ } from '../middleware/auth.js';

const router = express.Router();

router.use(authN, staffAuthZ);

router.get('/tickets', getTickets);
router.get('/summary', getSummary);
router.patch('/tickets/:id/resolve', resolveTicket);

router.get('/tickets/pool', getTicketPool);

router.patch('/tickets', claimTicket);

export default router;