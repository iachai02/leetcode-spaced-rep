/**
 * Shared UI constants for consistent styling across components
 */

export type Difficulty = "Easy" | "Medium" | "Hard";

/**
 * Tailwind classes for difficulty badge styling
 * Used with shadcn Badge component (variant="outline")
 */
export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: "bg-green-500/10 text-green-500 border-green-500/20",
  Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Hard: "bg-red-500/10 text-red-500 border-red-500/20",
};
