import { Request, Response, NextFunction } from 'express';
import { InterviewSession, RoadmapProfile, Report } from '../models/index.js';

class UserController {
  /**
   * GET /api/user/dashboard
   * Returns all roadmaps and interviews for the authenticated user.
   */
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const roadmaps = await RoadmapProfile.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .select('-weeklyPlan'); // Exclude heavy nested array for overview

      const sessions = await InterviewSession.find({ userId: req.user.id })
        .sort({ createdAt: -1 });

      // Fetch reports for completed sessions
      const sessionIds = sessions.map(s => s._id);
      const reports = await Report.find({ sessionId: { $in: sessionIds } });

      const mappedSessions = sessions.map(session => {
        const report = reports.find((r: any) => String(r.sessionId) === String(session._id));
        return {
          id: session._id,
          role: session.role,
          experience: session.experience,
          status: session.status,
          startedAt: session.startedAt,
          duration: session.duration,
          score: report ? Math.round((report.overallTechnicalScore + report.communicationScore + report.fluencyScore) / 3) : null,
        };
      });

      res.status(200).json({
        success: true,
        data: {
          roadmaps: roadmaps.map(r => ({
            id: r._id,
            targetRole: r.targetRole,
            totalWeeks: r.totalWeeks,
            createdAt: r.createdAt,
            completedTasksCount: r.completedTasks ? r.completedTasks.size : 0,
          })),
          interviews: mappedSessions,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/user/admin/dashboard
   * Admin only: returns system-wide stats.
   */
  async getAdminDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const totalUsers = await import('../models/User.js').then(m => m.User.countDocuments());
      const totalInterviews = await InterviewSession.countDocuments();
      const totalRoadmaps = await RoadmapProfile.countDocuments();

      const recentUsers = await import('../models/User.js').then(m => 
        m.User.find().sort({ createdAt: -1 }).limit(10).select('-passwordHash')
      );

      res.status(200).json({
        success: true,
        data: {
          stats: {
            totalUsers,
            totalInterviews,
            totalRoadmaps,
          },
          recentUsers,
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
