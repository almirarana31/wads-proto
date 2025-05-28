import express from 'express';
import { getTickets, getSummary } from '../controllers/staff.js';
import { authN, staffAuthZ } from '../middleware/auth.js';

const router = express.Router();

router.use(authN, staffAuthZ);

router.get('/tickets', getTickets);

router.get('/summary', getSummary);

export default router;