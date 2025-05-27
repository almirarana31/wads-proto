import { showAudit } from "../controllers/audit.js";
import express from 'express';
import {authN, adminAuthZ} from '../middleware/auth.js';

const router = express.Router();

// add middleware
router.use(authN, adminAuthZ);

router.get('/log', showAudit);

export default router;