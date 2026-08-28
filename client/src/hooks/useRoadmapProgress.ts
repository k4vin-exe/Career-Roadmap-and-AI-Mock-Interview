import { useCallback, useEffect, useState } from 'react';
import { updateRoadmapProgress } from '../services/roadmapApi';
import type { Roadmap, RoadmapProgress, RoadmapStats } from '../utils/roadmapTypes';

// ─── Task key helper ──────────────────────────────────────────────────────────
export function taskKey(week: number, day: number) {
  return `w${week}-d${day}`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useRoadmapProgress(roadmap: Roadmap | null) {
  const profileId = roadmap?.profileId ?? '';

  // Initialize progress from roadmap data, defaulting to empty if not provided.
  // The backend now provides roadmap.completedTasks directly.
  const [progress, setProgress] = useState<RoadmapProgress>(() => {
    return {
      profileId,
      completedTasks: roadmap?.completedTasks || {},
      lastUpdated: roadmap?.createdAt || new Date().toISOString(),
      currentWeek: 1, // Optional: you could derive this from the first uncompleted task
    };
  });

  // Re-load when roadmap changes (navigating between roadmaps or refreshing data)
  useEffect(() => {
    if (roadmap) {
      setProgress({
        profileId: roadmap.profileId,
        completedTasks: roadmap.completedTasks || {},
        lastUpdated: roadmap.createdAt || new Date().toISOString(),
        currentWeek: progress.currentWeek, // Preserve current view state
      });
    }
  }, [roadmap]);

  const toggleTask = useCallback((week: number, day: number) => {
    if (!profileId) return;

    const key = taskKey(week, day);
    
    // Optimistic update
    setProgress((prev) => {
      const newTasks = {
        ...prev.completedTasks,
        [key]: !prev.completedTasks[key],
      };
      
      const updated: RoadmapProgress = {
        ...prev,
        completedTasks: newTasks,
        lastUpdated: new Date().toISOString(),
      };

      // Sync to backend asynchronously
      updateRoadmapProgress(profileId, newTasks).catch(err => {
        console.error('Failed to sync roadmap progress to server:', err);
        // Optionally revert on error, but for MVP logging is sufficient
      });

      return updated;
    });
  }, [profileId]);

  const setCurrentWeek = useCallback((week: number) => {
    setProgress((prev) => ({
      ...prev,
      currentWeek: week,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const isTaskCompleted = useCallback(
    (week: number, day: number) => !!progress.completedTasks[taskKey(week, day)],
    [progress.completedTasks]
  );

  const isWeekCompleted = useCallback(
    (weekPlan: Roadmap['weeklyPlan'][0]) => {
      return weekPlan.dailyBreakdown.every((d) => isTaskCompleted(weekPlan.week, d.day));
    },
    [isTaskCompleted]
  );

  // Derive overall stats
  const stats: RoadmapStats = (() => {
    if (!roadmap) return { totalTasks: 0, completedCount: 0, percentage: 0, currentWeek: 1, weeksCompleted: 0 };

    const totalTasks = roadmap.weeklyPlan.reduce((s, w) => s + w.dailyBreakdown.length, 0);
    const completedCount = Object.values(progress.completedTasks).filter(Boolean).length;
    const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    const weeksCompleted = roadmap.weeklyPlan.filter((w) => isWeekCompleted(w)).length;

    return {
      totalTasks,
      completedCount,
      percentage,
      currentWeek: progress.currentWeek,
      weeksCompleted,
    };
  })();

  return { progress, stats, toggleTask, setCurrentWeek, isTaskCompleted, isWeekCompleted };
}
