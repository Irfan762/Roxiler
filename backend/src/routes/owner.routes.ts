import { Router } from 'express';
import ownerController from '../controllers/owner.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All owner routes require authentication + STORE_OWNER role
router.use(authenticate, requireRole('STORE_OWNER'));

router.get('/dashboard', ownerController.dashboard);
router.get('/ratings', ownerController.getRatings);

export default router;
