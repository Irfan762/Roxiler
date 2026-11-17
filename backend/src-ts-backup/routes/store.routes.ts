import { Router } from 'express';
import storeController from '../controllers/store.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody, validateIdParam } from '../middleware/validate';
import { ratingSchema } from '../validators/store.validator';

const router = Router();

// Store listing — any authenticated user can view
router.get('/', authenticate, requireRole('NORMAL_USER', 'SYSTEM_ADMIN', 'STORE_OWNER'), storeController.getStores);
router.get('/:id', authenticate, requireRole('NORMAL_USER', 'SYSTEM_ADMIN', 'STORE_OWNER'), validateIdParam('id'), storeController.getStoreById);

// Rating — only normal users can submit/edit ratings
router.post('/:id/rating', authenticate, requireRole('NORMAL_USER'), validateIdParam('id'), validateBody(ratingSchema), storeController.submitRating);
router.put('/:id/rating', authenticate, requireRole('NORMAL_USER'), validateIdParam('id'), validateBody(ratingSchema), storeController.updateRating);

export default router;
