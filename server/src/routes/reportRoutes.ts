import { Router } from 'express';
import interviewController from '../controllers/interviewController.js';
import { validateSessionId } from '../middleware/validators.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

// Get interview report
router.get(
  '/:sessionId',
  validateSessionId,
  interviewController.getReport.bind(interviewController)
);

export default router;
