export type Rating = "again" | "hard" | "medium" | "easy";

export interface SM2State {
  easeFactor: number;
  interval: number;
  repetitions: number;
  status: "new" | "learning" | "review" | "mastered";
}

export interface SM2Result extends SM2State {
  nextReview: Date;
}

const MINIMUM_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

export function calculateNextReview(
  rating: Rating,
  currentState: SM2State | null
): SM2Result {
  const state = currentState || {
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    status: "new" as const,
  };

  let { easeFactor, interval, repetitions } = state;
  let status: SM2State["status"];

  switch (rating) {
    case "again":
      repetitions = 0;
      interval = 1;
      easeFactor = Math.max(MINIMUM_EASE_FACTOR, easeFactor - 0.2);
      status = "learning";
      break;

    case "hard":
      repetitions += 1;
      interval = Math.max(1, Math.round(interval * 1.2));
      easeFactor = Math.max(MINIMUM_EASE_FACTOR, easeFactor - 0.15);
      status = interval >= 21 ? "review" : "learning";
      break;

    case "medium":
      repetitions += 1;
      if (interval === 0) {
        interval = 1;
      } else if (interval === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      status = interval >= 30 ? "mastered" : interval >= 21 ? "review" : "learning";
      break;

    case "easy":
      repetitions += 1;
      if (interval === 0) {
        interval = 4;
      } else if (interval === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor * 1.3);
      }
      easeFactor = Math.min(3.0, easeFactor + 0.15);
      status = interval >= 30 ? "mastered" : interval >= 21 ? "review" : "learning";
      break;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  nextReview.setHours(0, 0, 0, 0);

  return {
    easeFactor,
    interval,
    repetitions,
    status,
    nextReview,
  };
}

export function previewIntervals(currentState: SM2State | null): Record<Rating, number> {
  return {
    again: calculateNextReview("again", currentState).interval,
    hard: calculateNextReview("hard", currentState).interval,
    medium: calculateNextReview("medium", currentState).interval,
    easy: calculateNextReview("easy", currentState).interval,
  };
}

export function formatInterval(days: number): string {
  if (days === 1) return "1d";
  if (days < 7) return `${days}d`;
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return `${weeks}w`;
  }
  const months = Math.round(days / 30);
  return `${months}mo`;
}
