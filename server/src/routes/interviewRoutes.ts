import { Router } from 'express';
import interviewController from '../controllers/interviewController.js';
import { geminiLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  validateStartInterview,
  validateSubmitAnswer,
  validateSessionId,
} from '../middleware/validators.js';

const router = Router();

// Apply auth middleware to all interview routes
router.use(requireAuth);

// Start a new interview session (generates questions via Gemini)
router.post(
  '/start',
  geminiLimiter,
  validateStartInterview,
  interviewController.startInterview.bind(interviewController)
);

// Get session details
router.get(
  '/:sessionId',
  validateSessionId,
  interviewController.getSession.bind(interviewController)
);

// Get questions for a session
router.get(
  '/:sessionId/questions',
  validateSessionId,
  interviewController.getQuestions.bind(interviewController)
);

// Evaluate warmup self-introduction
router.post(
  '/:sessionId/warmup',
  geminiLimiter,
  validateSessionId,
  interviewController.evaluateWarmup.bind(interviewController)
);

// Submit an answer (evaluates via Gemini)
router.post(
  '/:sessionId/answer',
  geminiLimiter,
  validateSubmitAnswer,
  interviewController.submitAnswer.bind(interviewController)
);

// Generate final report (via Gemini)
router.post(
  '/:sessionId/report',
  geminiLimiter,
  validateSessionId,
  interviewController.generateReport.bind(interviewController)
);

export default router;
