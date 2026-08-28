import type { Request, Response, NextFunction } from 'express';
import roadmapService from '../services/roadmapService.js';

function createError(message: string, status: number) {
  const err = new Error(message) as any;
  err.status = status;
  return err;
}

class RoadmapController {
  /**
   * POST /api/roadmap/generate
   * Accepts a user profile, generates a roadmap, stores it, and returns it.
   */
  async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, workExperience, currentRole, skills, ugField, pgField, bio, desiredRole } = req.body;

      if (!name || !workExperience || !ugField || !desiredRole) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, workExperience, ugField, desiredRole',
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      console.log(`🗺️  Generating roadmap for ${name} → ${desiredRole}`);

      const roadmap = await roadmapService.generateRoadmap(req.user.id, {
        name: String(name),
        workExperience: String(workExperience),
        currentRole: String(currentRole || ''),
        skills: Array.isArray(skills) ? skills : [],
        ugField: String(ugField),
        pgField: String(pgField || ''),
        bio: String(bio || ''),
        desiredRole: String(desiredRole),
      });

      res.status(201).json({ success: true, data: roadmap });
    } catch (error) {
      next(createError((error as Error).message, 500));
    }
  }

  /**
   * GET /api/roadmap/:profileId
   * Returns a previously generated roadmap.
   */
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roadmap = await roadmapService.getRoadmap(req.params.profileId as string);
      res.status(200).json({ success: true, data: roadmap });
    } catch (error) {
      const err = error as Error;
      if (err.message === 'Roadmap not found') {
        res.status(404).json({ success: false, error: 'Roadmap not found' });
        return;
      }
      next(createError(err.message, 500));
    }
  }
  /**
   * POST /api/roadmap/:profileId/progress
   * Syncs roadmap progress (checkboxes)
   */
  async updateProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { completedTasks } = req.body;

      if (!completedTasks) {
        res.status(400).json({ success: false, error: 'Missing completedTasks in body' });
        return;
      }

      const roadmap = await roadmapService.updateProgress(req.params.profileId as string, req.user.id, completedTasks);
      res.status(200).json({ success: true, data: roadmap });
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('not found')) {
        res.status(404).json({ success: false, error: err.message });
        return;
      }
      next(createError(err.message, 500));
    }
  }
}

export default new RoadmapController();
