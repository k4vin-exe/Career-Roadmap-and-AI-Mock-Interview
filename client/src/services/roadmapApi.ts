import api from './api';
import type { UserProfile, Roadmap } from '../utils/roadmapTypes';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Sends user profile to the backend and returns the generated roadmap.
 */
export async function generateRoadmap(profile: UserProfile): Promise<Roadmap> {
  const response = await api.post<ApiResponse<Roadmap>>('/roadmap/generate', profile, {
    timeout: 90000, // Roadmap generation can take up to 90s
  });
  return response.data.data;
}

/**
 * Retrieves a previously generated roadmap by its profileId.
 */
export async function getRoadmap(profileId: string): Promise<Roadmap> {
  const response = await api.get<ApiResponse<Roadmap>>(`/roadmap/${profileId}`);
  return response.data.data;
}

/**
 * Updates the completed tasks map for a roadmap.
 */
export async function updateRoadmapProgress(profileId: string, completedTasks: Record<string, boolean>): Promise<Roadmap> {
  const response = await api.post<ApiResponse<Roadmap>>(`/roadmap/${profileId}/progress`, {
    completedTasks
  });
  return response.data.data;
}
