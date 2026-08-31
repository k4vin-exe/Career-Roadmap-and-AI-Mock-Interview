import { Router } from 'express';
import interviewController from '../controllers/interviewController.js';
import { geminiLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  validateStartInterview,
  validateSubmitAnswer,
  validateSessionId,
} from '../middleware/validators.js';

import multer from 'multer';
import os from 'os';
import path from 'path';

const router = Router();

// Configure multer for audio uploads (disk storage for Groq API streaming)
// We MUST preserve the file extension so Groq/OpenAI SDK can infer the mime type
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.webm');
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max size per Groq limits
});

// Apply auth middleware to all interview routes
router.use(requireAuth);

// Transcribe audio using Groq Whisper API
router.post(
  '/transcribe',
  upload.single('file'),
  interviewController.transcribeAudio.bind(interviewController)
);

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
