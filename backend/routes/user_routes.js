import express from 'express';
import { signUp, activate, logIn, signOut, forgetPassword, getUserTickets, submitTicket, editTicket, cancelTicket, enterNewPass, getUserDetail, validResetLink } from '../controllers/user.js';
import { userAuthZ, guestAuthZ, authN, getUserRoles } from '../middleware/auth.js'; // to be used for user-resource fetching 

const router = express.Router();

// sign up, login, sign out
router.get('/sign-out', signOut); // this 

router.post('/sign-up', signUp);

router.post('/log-in', logIn);

router.get('/activate/:token', activate);

router.post('/forget-password', forgetPassword);

router.get('/verify-reset-link/:token', validResetLink);

router.post('/enter-new-password/:token', enterNewPass);

// ticket submission
router.post('/tickets', guestAuthZ, submitTicket); // no authentication required because of guest users

router.put('/tickets/:id', authN, userAuthZ, editTicket) // uses authN

router.patch('/tickets/:id', authN, userAuthZ, cancelTicket) // uses authN

// user dashboard -- use userAuthZ middleware
router.get('/tickets', userAuthZ, getUserTickets);  // this 

router.get('/user-roles', getUserRoles); // this

router.get('/details', userAuthZ, getUserDetail); // this

export default router;