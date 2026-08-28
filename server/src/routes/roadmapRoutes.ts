import { Router } from 'express';
import roadmapController from '../controllers/roadmapController.js';
import { geminiLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/roadmap/generate — generate a new roadmap
router.post('/generate', requireAuth, geminiLimiter, roadmapController.generate.bind(roadmapController));

// GET /api/roadmap/:profileId — retrieve an existing roadmap
router.get('/:profileId', requireAuth, roadmapController.get.bind(roadmapController));

// POST /api/roadmap/:profileId/progress — update roadmap progress
router.post('/:profileId/progress', requireAuth, roadmapController.updateProgress.bind(roadmapController));

export default router;
