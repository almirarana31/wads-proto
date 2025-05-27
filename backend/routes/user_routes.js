import express from 'express';
import { signUp, activate, logIn, signOut, forgetPassword, confirmPassReset, getUserTickets, submitTicket } from '../controllers/user.js';
import { userAuthZ, guestAuthZ } from '../middleware/auth.js'; // to be used for user-resource fetching 

const router = express.Router();

// sign up, login, sign out
router.get('/sign-out', signOut);

router.post('/sign-up', signUp);

router.post('/log-in', logIn);

router.get('/activate/:token', activate);

router.post('/forget-password', forgetPassword);

router.get('/confirm-password-reset/:token', confirmPassReset);

// ticket submission
router.post('/tickets', guestAuthZ, submitTicket);

// user dashboard -- use userAuthZ middleware
router.get('/tickets', userAuthZ, getUserTickets);

export default router;