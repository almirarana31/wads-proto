import express from 'express';
import initialQueries from '../controllers/defaultQueries.js'

const router = express.Router();

router.get('/post-init-values', initialQueries);

export default router