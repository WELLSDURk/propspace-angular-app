import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/profile', authMiddleware as any, getProfile as any);
router.put('/profile', authMiddleware as any, updateProfile as any);
router.put('/password', authMiddleware as any, changePassword as any);

export default router;
