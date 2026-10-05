import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { loginSchema, signupSchema, changePasswordSchema } from '../validators/auth.validator';

const router = Router();

// Public routes
router.post('/signup', validateBody(signupSchema), authController.signup);
router.post('/login', validateBody(loginSchema), authController.login);

// Authenticated routes
router.post('/change-password', authenticate, validateBody(changePasswordSchema), authController.changePassword);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
