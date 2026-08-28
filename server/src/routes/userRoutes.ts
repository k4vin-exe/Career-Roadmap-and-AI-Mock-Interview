import { Router } from 'express';
import userController from '../controllers/userController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

// GET /api/user/dashboard — user's personal dashboard data
router.get('/dashboard', userController.getDashboard.bind(userController));

// GET /api/user/admin/dashboard — admin stats
router.get('/admin/dashboard', requireAdmin, userController.getAdminDashboard.bind(userController));

export default router;
