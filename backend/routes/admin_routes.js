import express from 'express';
import { getStatusSummary, getTickets, getAdminUsername, getStaffPerformance } from '../controllers/admin.js';
import { authN, adminAuthZ } from '../middleware/auth.js';

const router = express.Router();

// add middleware 

router.use(authN, adminAuthZ);

// admin dashboard

router.get('/get-status-summary', getStatusSummary);

router.get('/get-username/:id', getAdminUsername);

router.get('/get-tickets', getTickets);

router.get('/get-staff-performance', getStaffPerformance);

export default router;