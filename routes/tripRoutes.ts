import express from 'express';
import { protectedRoutes } from '../controllers/auth/authController';
import { createRoute, getBusRoutes } from '../controllers/busRoutes/busRoutes';
const router = express.Router();

router.post('/create', protectedRoutes, createRoute);
router.post('/get-routes', getBusRoutes);

export default router;
