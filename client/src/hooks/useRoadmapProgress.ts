import { useCallback, useEffect, useState } from 'react';
import { updateRoadmapProgress } from '../services/roadmapApi';
import type { Roadmap, RoadmapProgress, RoadmapStats, WeeklyPlan } from '../utils/roadmapTypes';

// ─── Key Helpers ──────────────────────────────────────────────────────────────
export function taskKey(week: number, day: number) {
  return `w${week}-d${day}`;
}

export function practiceKey(week: number) {
  return `w${week}-practice`;
}

export function quizKey(week: number) {
  return `w${week}-quiz`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useRoadmapProgress(roadmap: Roadmap | null) {
  const profileId = roadmap?.profileId ?? '';

  // Initialize progress from roadmap data
  const [progress, setProgress] = useState<RoadmapProgress>(() => {
    return {
      profileId,
      completedTasks: (roadmap as any)?.completedTasks || {},
      lastUpdated: roadmap?.createdAt || new Date().toISOString(),
      currentWeek: 1,
    };
  });

  // Re-load when roadmap changes
  useEffect(() => {
    if (roadmap) {
      setProgress({
        profileId: roadmap.profileId,
        completedTasks: (roadmap as any)?.completedTasks || {},
        lastUpdated: roadmap.createdAt || new Date().toISOString(),
        currentWeek: progress.currentWeek,
      });
    }
  }, [roadmap]);

  // Helper to persist to server asynchronously
  const syncProgress = useCallback(
    (newTasks: Record<string, boolean>) => {
      if (!profileId) return;
      updateRoadmapProgress(profileId, newTasks).catch((err) => {
        console.error('Failed to sync roadmap progress to server:', err);
      });
    },
    [profileId]
  );

  // Toggle daily task
  const toggleTask = useCallback(
    (week: number, day: number) => {
      if (!profileId) return;
      const key = taskKey(week, day);

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
        syncProgress(newTasks);
        return updated;
      });
    },
    [profileId, syncProgress]
  );

  // Toggle weekly practice completion
  const togglePractice = useCallback(
    (week: number) => {
      if (!profileId) return;
      const key = practiceKey(week);

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
        syncProgress(newTasks);
        return updated;
      });
    },
    [profileId, syncProgress]
  );

  // Mark weekly quiz as completed
  const completeQuiz = useCallback(
    (week: number) => {
      if (!profileId) return;
      const key = quizKey(week);

      setProgress((prev) => {
        const newTasks = {
          ...prev.completedTasks,
          [key]: true,
        };
        const updated: RoadmapProgress = {
          ...prev,
          completedTasks: newTasks,
          lastUpdated: new Date().toISOString(),
        };
        syncProgress(newTasks);
        return updated;
      });
    },
    [profileId, syncProgress]
  );

  const isTaskCompleted = useCallback(
    (week: number, day: number) => !!progress.completedTasks[taskKey(week, day)],
    [progress.completedTasks]
  );

  const isPracticeCompleted = useCallback(
    (week: number) => !!progress.completedTasks[practiceKey(week)],
    [progress.completedTasks]
  );

  const isQuizCompleted = useCallback(
    (week: number) => !!progress.completedTasks[quizKey(week)],
    [progress.completedTasks]
  );

  const isWeekCompleted = useCallback(
    (weekPlan: WeeklyPlan) => {
      const allDailyDone = weekPlan.dailyBreakdown.length === 0 ||
        weekPlan.dailyBreakdown.every((d) => isTaskCompleted(weekPlan.week, d.day));
      const practiceDone = isPracticeCompleted(weekPlan.week);
      const quizDone = isQuizCompleted(weekPlan.week);

      return allDailyDone && practiceDone && quizDone;
    },
    [isTaskCompleted, isPracticeCompleted, isQuizCompleted]
  );

  // Week-by-week unlock logic:
  // Week 1 is always unlocked.
  // Week N is unlocked only if Week N-1 is completed.
  const isWeekUnlocked = useCallback(
    (weekNum: number) => {
      if (weekNum <= 1) return true;
      if (!roadmap) return false;

      // Check all previous weeks
      for (let w = 1; w < weekNum; w++) {
        const prevPlan = roadmap.weeklyPlan.find((p) => p.week === w);
        if (prevPlan && !isWeekCompleted(prevPlan)) {
          return false;
        }
      }
      return true;
    },
    [roadmap, isWeekCompleted]
  );

  // Derive overall stats
  const stats: RoadmapStats = (() => {
    if (!roadmap) return { totalTasks: 0, completedCount: 0, percentage: 0, currentWeek: 1, weeksCompleted: 0 };

    const totalTasks = roadmap.weeklyPlan.reduce((s, w) => s + w.dailyBreakdown.length, 0);
    const completedCount = roadmap.weeklyPlan.reduce((count, w) => {
      return count + w.dailyBreakdown.filter((d) => isTaskCompleted(w.week, d.day)).length;
    }, 0);

    const weeksCompleted = roadmap.weeklyPlan.filter((w) => isWeekCompleted(w)).length;

    // Find current active week (first uncompleted week, or last week if all done)
    const activePlan = roadmap.weeklyPlan.find((w) => !isWeekCompleted(w));
    const currentWeek = activePlan ? activePlan.week : roadmap.totalWeeks;

    // Total completion percentage based on total weeks completed + current week task progress
    const totalWeeks = roadmap.weeklyPlan.length || 1;
    const percentage = Math.min(100, Math.round((weeksCompleted / totalWeeks) * 100));

    return {
      totalTasks,
      completedCount,
      percentage,
      currentWeek,
      weeksCompleted,
    };
  })();

  return {
    progress,
    stats,
    toggleTask,
    togglePractice,
    completeQuiz,
    isTaskCompleted,
    isPracticeCompleted,
    isQuizCompleted,
    isWeekCompleted,
    isWeekUnlocked,
  };
}
