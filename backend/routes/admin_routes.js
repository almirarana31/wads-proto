import express from 'express';
import { getStatusSummary, getTickets, getAdminUsername, 
    getStaffPerformance, searchStaff, assignStaff, 
     createStaff,updateField, getStaff, 
     editStaff} from '../controllers/admin.js';
import { authN, adminAuthZ } from '../middleware/auth.js';

const router = express.Router();

// add middleware 

router.use(authN, adminAuthZ);

// admin dashboard start here

router.get('/status-summary', getStatusSummary);

router.get('/username', getAdminUsername);

router.get('/all-tickets', getTickets);

router.get('/staff-performance', getStaffPerformance);

router.get('/staff/:ticket_id', searchStaff);

router.get('/staff-detail/:id', getStaff);

router.patch('/staff-detail/:id', editStaff);

// attribures updating
router.patch('/tickets/:id', updateField)

// assigned staff updating
router.patch('/tickets/:ticket_id/staff', assignStaff)

// create new staff
router.post('/staff', createStaff)

// admin dashboard ends here

// view action
// get details of a specific ticket



export default router;