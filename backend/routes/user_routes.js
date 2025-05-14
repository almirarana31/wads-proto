import express from 'express';
import { signUp } from '../controllers/user.js';

const router = express.Router();

router.post('/sign-up', signUp);

router.get('//')

export default router;