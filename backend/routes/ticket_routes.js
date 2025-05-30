import express from 'express';
import { getCategory, getPriority, getStatus, getTicketDetail} from '../controllers/ticket.js';
import { authN, adminAuthZ, staffAuthZ, softAuthZ, userAuthZ } from '../middleware/auth.js';

const router = express.Router();

router.use(authN);

// fetching available options for each fields
router.get('/categories', getCategory);
router.get('/priorities', staffAuthZ, getPriority);
router.get('/statuses', getStatus);
router.get('/:id', userAuthZ, softAuthZ, getTicketDetail);

export default router;