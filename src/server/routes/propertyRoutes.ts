import { Router } from 'express';
import { 
  getAllProperties, 
  getPropertyById, 
  createProperty, 
  updateProperty, 
  deleteProperty, 
  getUserProperties 
} from '../controllers/propertyController';
import { authMiddleware } from '../middleware/auth';
import { validateProperty } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);

// Protected routes (require auth)
router.post('/', authMiddleware as any, validateProperty, createProperty as any);
router.put('/:id', authMiddleware as any, validateProperty, updateProperty as any);
router.delete('/:id', authMiddleware as any, deleteProperty as any);
router.get('/user/listings', authMiddleware as any, getUserProperties as any);

export default router;
