import type { Rating } from "./sm2";

// XP Calculation System
// Base XP depends on problem difficulty, modified by rating and streak

const BASE_XP: Record<string, number> = {
  Easy: 10,
  Medium: 25,
  Hard: 50,
};

const RATING_MULTIPLIER: Record<Rating, number> = {
  again: 0.5,
  hard: 1.0,
  medium: 1.5,
  easy: 2.0,
};

// Streak bonus: +10% per day, capped at 100% (10-day streak)
const STREAK_BONUS_PER_DAY = 0.1;
const MAX_STREAK_BONUS = 1.0; // 100% max bonus

export function calculateXP(
  difficulty: "Easy" | "Medium" | "Hard" | null,
  rating: Rating,
  streakDays: number
): number {
  const baseXP = BASE_XP[difficulty ?? "Medium"] ?? 25;
  const ratingMult = RATING_MULTIPLIER[rating];
  const streakBonus = Math.min(streakDays * STREAK_BONUS_PER_DAY, MAX_STREAK_BONUS);
  const streakMult = 1 + streakBonus;

  return Math.round(baseXP * ratingMult * streakMult);
}

// Rank System - Career progression themed
export interface Rank {
  name: string;
  minXP: number;
  color: string; // For UI styling
  badge?: string; // Optional badge image path for special ranks
}

export const RANKS: Rank[] = [
  { name: "Technical Intern", minXP: 0, color: "#D4A574", badge: "/badges/technical-intern.png" }, // bronze/gold
  { name: "Junior Developer", minXP: 500, color: "#84CC16" },      // lime
  { name: "Software Engineer", minXP: 2000, color: "#22C55E" },    // green
  { name: "Senior Engineer", minXP: 5000, color: "#3B82F6" },      // blue
  { name: "Staff Engineer", minXP: 12000, color: "#8B5CF6" },      // violet
  { name: "Principal Architect", minXP: 25000, color: "#EC4899" }, // pink
  { name: "Distinguished Engineer", minXP: 50000, color: "#F97316" }, // orange
  { name: "Technical Fellow", minXP: 100000, color: "#EAB308" },   // yellow/gold
  { name: "LeetCode Legend", minXP: 250000, color: "#10B981", badge: "/badges/leetcode-legend.png" }, // emerald green with special badge
];

export function getRank(xp: number): Rank {
  // Find the highest rank the user qualifies for
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

export function getNextRank(xp: number): Rank | null {
  const currentRank = getRank(xp);
  const currentIndex = RANKS.findIndex((r) => r.name === currentRank.name);
  if (currentIndex < RANKS.length - 1) {
    return RANKS[currentIndex + 1];
  }
  return null; // Already at max rank
}

export function getProgressToNextRank(xp: number): {
  currentRank: Rank;
  nextRank: Rank | null;
  progressXP: number;
  requiredXP: number;
  percentage: number;
} {
  const currentRank = getRank(xp);
  const nextRank = getNextRank(xp);

  if (!nextRank) {
    // At max rank
    return {
      currentRank,
      nextRank: null,
      progressXP: 0,
      requiredXP: 0,
      percentage: 100,
    };
  }

  const progressXP = xp - currentRank.minXP;
  const requiredXP = nextRank.minXP - currentRank.minXP;
  const percentage = Math.min(100, Math.round((progressXP / requiredXP) * 100));

  return {
    currentRank,
    nextRank,
    progressXP,
    requiredXP,
    percentage,
  };
}

// Category-specific rank tracking
// Uses the same rank system but tracked per problem category
export const CATEGORIES = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Tries",
  "Heap / Priority Queue",
  "Backtracking",
  "Graphs",
  "Advanced Graphs",
  "1-D Dynamic Programming",
  "2-D Dynamic Programming",
  "Greedy",
  "Intervals",
  "Math & Geometry",
  "Bit Manipulation",
] as const;

export type Category = (typeof CATEGORIES)[number];
