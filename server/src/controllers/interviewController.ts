import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import fs from 'fs';
import interviewService from '../services/interviewService.js';
import GroqService from '../services/groqService.js';
import { createAppError } from '../middleware/errorHandler.js';

/**
 * InterviewController — Handles HTTP requests for the interview flow.
 * Thin layer: validates input, delegates to service, formats response.
 */
export class InterviewController {
  /**
   * POST /api/interview/transcribe
   * Transcribes an uploaded audio file using Groq Whisper.
   */
  async transcribeAudio(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No audio file provided' });
        return;
      }

      const filePath = req.file.path;
      console.log(`📁 Received audio file: ${filePath} (${req.file.size} bytes)`);
      
      const groqService = GroqService.getInstance();
      // Pass the file path — groqService internally wraps it with toFile
      const transcript = await groqService.transcribeAudio(filePath);

      // Clean up temp file
      fs.unlink(filePath, (err) => {
        if (err) console.error('Failed to delete temp audio file:', err);
      });

      res.status(200).json({ success: true, text: transcript });
    } catch (error) {
      // Ensure temp file is cleaned up on error too
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      console.error('transcribeAudio controller error:', (error as Error).message);
      next(createAppError((error as Error).message, 500));
    }
  }

  /**
   * POST /api/interview/start
   * Creates a new interview session and generates questions.
   */
  async startInterview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!(req as any).user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { name, role, experience } = req.body;
      const result = await interviewService.startInterview({ userId: (req as any).user.id, name, role, experience });

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

      const result = await interviewService.getSession(req.params.sessionId as string);

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

      const questions = await interviewService.getQuestions(req.params.sessionId as string);

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

      const result = await interviewService.submitAnswer({
        sessionId: req.params.sessionId as string,
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
      const { name, transcript, totalWords, fluencyScore } = req.body;

      const result = await interviewService.evaluateWarmup({
        sessionId: req.params.sessionId as string,
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

      const report = await interviewService.generateReport(req.params.sessionId as string);

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

      const result = await interviewService.getReport(req.params.sessionId as string);

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
