import express from 'express';
import { getStatusSummary, getTickets, getAdminUsername, 
    getStaffPerformance, searchStaff, assignStaff, 
     createStaff,updateField, getStaff, 
     editStaff,
     getAccStatus} from '../controllers/admin.js';
import { authN, adminAuthZ } from '../middleware/auth.js';

const router = express.Router();

// add middleware 

router.use(authN, adminAuthZ);

// admin dashboard start here

// check staff account status
router.get('/account/:adminID/activation-status', getAccStatus)

router.get('/status-summary', getStatusSummary);

router.get('/username', getAdminUsername);

router.get('/all-tickets', getTickets);

router.get('/staff-performance', getStaffPerformance);

router.get('/staff/ticket/:ticketID', searchStaff);

router.get('/staff-detail/:staffID', getStaff);

router.patch('/staff-detail/:staffID', editStaff);

// attribures updating
router.patch('/tickets/:ticketID', updateField)

// assigned staff updating
router.patch('/tickets/:ticketID/staff', assignStaff)

// create new staff
router.post('/staff', createStaff)


export default router;