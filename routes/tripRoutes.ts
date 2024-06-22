import express from 'express';
import { protectedRoutes } from '../controllers/auth/authController';
import { createRoute, getBusRoutes, helloWorld } from '../controllers/busRoutes/busRoutes';
const router = express.Router();

router.post('/create', protectedRoutes, createRoute);
router.post('/get-routes', getBusRoutes);
router.get('/test', helloWorld);

export default router;
