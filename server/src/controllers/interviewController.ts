import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import interviewService from '../services/interviewService.js';
import { createAppError } from '../middleware/errorHandler.js';

/**
 * InterviewController — Handles HTTP requests for the interview flow.
 * Thin layer: validates input, delegates to service, formats response.
 */
export class InterviewController {
  /**
   * POST /api/interview/start
   * Creates a new interview session and generates questions.
   */
  async startInterview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { name, role, experience } = req.body;
      const result = await interviewService.startInterview({ name, role, experience });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(createAppError((error as Error).message, 500));
    }
  }

  /**
   * GET /api/interview/:sessionId
   * Retrieves full session details including questions and responses.
   */
  async getSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { sessionId } = req.params;
      const result = await interviewService.getSession(sessionId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(createAppError((error as Error).message, 404));
    }
  }

  /**
   * GET /api/interview/:sessionId/questions
   * Retrieves questions for a session.
   */
  async getQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { sessionId } = req.params;
      const questions = await interviewService.getQuestions(sessionId);

      res.status(200).json({
        success: true,
        data: questions,
      });
    } catch (error) {
      next(createAppError((error as Error).message, 404));
    }
  }

  /**
   * POST /api/interview/:sessionId/answer
   * Submits a candidate's answer with pre-computed speech metrics.
   */
  async submitAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { sessionId } = req.params;
      const result = await interviewService.submitAnswer({
        sessionId,
        ...req.body,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(createAppError((error as Error).message, 500));
    }
  }

  /**
   * POST /api/interview/:sessionId/warmup
   * Evaluates the candidate's self-introduction.
   */
  async evaluateWarmup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { name, transcript, totalWords, fluencyScore } = req.body;

      const result = await interviewService.evaluateWarmup({
        sessionId,
        name: name || 'Candidate',
        transcript: transcript || '',
        totalWords: totalWords || 0,
        fluencyScore: fluencyScore || 70,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(createAppError((error as Error).message, 500));
    }
  }

  /**
   * POST /api/interview/:sessionId/report
   * Generates the final interview report.
   */
  async generateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { sessionId } = req.params;
      const report = await interviewService.generateReport(sessionId);

      res.status(201).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(createAppError((error as Error).message, 500));
    }
  }

  /**
   * GET /api/report/:sessionId
   * Retrieves a stored interview report.
   */
  async getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { sessionId } = req.params;
      const result = await interviewService.getReport(sessionId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(createAppError((error as Error).message, 404));
    }
  }
}

export default new InterviewController();
