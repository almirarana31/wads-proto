import express from 'express';
import { signUp, activate, logIn, signOut, forgetPassword, confirmPassReset} from '../controllers/user.js';

const router = express.Router();

router.get('/sign-out', signOut);

router.post('/sign-up', signUp);

router.post('/log-in', logIn);

router.get('/activate/:token', activate);

router.post('/forget-password', forgetPassword);

router.get('/confirm-password-reset/:token', confirmPassReset);

export default router;