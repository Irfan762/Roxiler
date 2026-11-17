import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody, validateIdParam } from '../middleware/validate';
import { createUserSchema } from '../validators/user.validator';
import { createStoreSchema } from '../validators/store.validator';

const router = Router();

// All admin routes require authentication + SYSTEM_ADMIN role
router.use(authenticate, requireRole('SYSTEM_ADMIN'));

// Dashboard
router.get('/dashboard', adminController.dashboard);

// User management
router.get('/users', adminController.getUsers);
router.post('/users', validateBody(createUserSchema), adminController.createUser);
router.get('/users/:id', validateIdParam('id'), adminController.getUserDetails);

// Store management
router.get('/stores', adminController.getStores);
router.post('/stores', validateBody(createStoreSchema), adminController.createStore);

export default router;
