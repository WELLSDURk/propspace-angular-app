import { Router } from 'express';
import { register, login, logout, verifyToken } from '../controllers/authController';
import { validateRegistration } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', validateRegistration, register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/verify', authMiddleware as any, verifyToken as any);

export default router;
