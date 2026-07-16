import axios from 'axios';
import type {
  InterviewSession,
  AnswerResponse,
  SubmitAnswerPayload,
  InterviewReport,
  Question,
  ApiResponse,
} from '../utils/types';

// In development, Vite proxy handles /api → backend
// In production, set this to the deployed backend URL
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s timeout for Gemini calls
});

// ──────────────────────────── Interview API ────────────────────────────

/**
 * Starts a new interview session.
 * Sends name, role, experience → backend creates session + generates questions via Gemini.
 */
export async function startInterview(
  name: string,
  role: string,
  experience: string
): Promise<InterviewSession> {
  const response = await api.post<ApiResponse<InterviewSession>>('/interview/start', {
    name,
    role,
    experience,
  });
  return response.data.data;
}

/**
 * Gets session details with questions and existing responses.
 */
export async function getSession(sessionId: string) {
  const response = await api.get<ApiResponse<{ session: any; questions: Question[]; responses: any[] }>>(
    `/interview/${sessionId}`
  );
  return response.data.data;
}

/**
 * Gets questions for a session.
 */
export async function getQuestions(sessionId: string): Promise<Question[]> {
  const response = await api.get<ApiResponse<Question[]>>(
    `/interview/${sessionId}/questions`
  );
  return response.data.data;
}

/**
 * Submits a candidate's answer with pre-computed speech metrics.
 */
export async function submitAnswer(
  sessionId: string,
  payload: SubmitAnswerPayload
): Promise<AnswerResponse> {
  const response = await api.post<ApiResponse<AnswerResponse>>(
    `/interview/${sessionId}/answer`,
    payload
  );
  return response.data.data;
}

/**
 * Generates the final interview report.
 */
export async function generateReport(sessionId: string): Promise<InterviewReport> {
  const response = await api.post<ApiResponse<InterviewReport>>(
    `/interview/${sessionId}/report`
  );
  return response.data.data;
}

/**
 * Retrieves a stored interview report.
 */
export async function getReport(sessionId: string) {
  const response = await api.get<ApiResponse<{
    report: InterviewReport;
    session: any;
    questions: Question[];
    responses: any[];
  }>>(`/report/${sessionId}`);
  return response.data.data;
}

export default api;
