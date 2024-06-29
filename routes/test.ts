import express from 'express';
import { protectedRoutes } from '../controllers/auth/authController';
import { createRoute, getBusRoutes, helloWorld } from '../controllers/busRoutes/busRoutes';
const router = express.Router();

router.get('/', helloWorld);

export default router;
