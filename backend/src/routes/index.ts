import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import storeRoutes from './store.routes';
import ownerRoutes from './owner.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Route groups
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/stores', storeRoutes);
router.use('/owner', ownerRoutes);

export default router;
