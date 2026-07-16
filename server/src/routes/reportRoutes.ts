import { Router } from 'express';
import interviewController from '../controllers/interviewController.js';
import { validateSessionId } from '../middleware/validators.js';

const router = Router();

// Get interview report
router.get(
  '/:sessionId',
  validateSessionId,
  interviewController.getReport.bind(interviewController)
);

export default router;
