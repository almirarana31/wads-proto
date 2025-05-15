import express from 'express';
import { signUp, activate, logIn} from '../controllers/user.js';

const router = express.Router();

router.post('/sign-up', signUp);

router.post('/log-in', logIn);

router.get('/activate/:token', activate);

export default router;