import express from 'express';
import PiloteRouter from './PiloteRoutes.js';

const router = express.Router();

router.use('/pilote', PiloteRouter);

export default router;