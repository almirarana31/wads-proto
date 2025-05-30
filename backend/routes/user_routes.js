import express from 'express';
import { signUp, activate, logIn, signOut, forgetPassword, getUserTickets, submitTicket, editTicket, cancelTicket, enterNewPass } from '../controllers/user.js';
import { userAuthZ, guestAuthZ, authN } from '../middleware/auth.js'; // to be used for user-resource fetching 

const router = express.Router();

// sign up, login, sign out
router.get('/sign-out', signOut);

router.post('/sign-up', signUp);

router.post('/log-in', logIn);

router.get('/activate/:token', activate);

router.post('/forget-password', forgetPassword);

router.post('/enter-new-password/:token', enterNewPass);

// ticket submission
router.post('/tickets', guestAuthZ, submitTicket); // no authentication required because of guest users

router.put('/tickets/:id', authN, userAuthZ, editTicket) // uses authN

router.patch('/tickets/:id', authN, userAuthZ, cancelTicket) // uses authN

// user dashboard -- use userAuthZ middleware
router.get('/tickets', userAuthZ, getUserTickets); 

export default router;