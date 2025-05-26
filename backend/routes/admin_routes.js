import express from 'express';
import { getStatusSummary, getTickets, getAdminUsername, 
    getStaffPerformance, searchStaff, assignStaff, 
    getCategory, getPriority, getStatus,
    updateField } from '../controllers/admin.js';
import { authN, adminAuthZ } from '../middleware/auth.js';

const router = express.Router();

// add middleware 

router.use(authN, adminAuthZ);

// admin dashboard start here

router.get('/status-summary', getStatusSummary);

router.get('/username', getAdminUsername);

router.get('/tickets', getTickets);

router.get('/staff-performance', getStaffPerformance);

router.get('/staff/:ticket_id', searchStaff);

// attributes fetching 
router.get('/categories', getCategory);
router.get('/priorities', getPriority);
router.get('/statuses', getStatus);

// attribures updating
router.patch('/tickets/:id', updateField)

// admin dashboard ends here

// ticket routes
router.patch('/tickets/:ticket_id/staff', assignStaff)

export default router;