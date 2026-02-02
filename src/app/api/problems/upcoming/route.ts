import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/problems/upcoming
 *
 * Returns problems the user has already attempted, sorted by next_review date.
 * This is different from /queue which returns DUE problems for today.
 *
 * Think of it like a calendar view:
 * - Queue = "What should I do today?"
 * - Upcoming = "What's my schedule look like?"
 *
 * We only show attempted problems because new problems don't have a scheduled
 * review date yet - they appear in the queue based on curriculum order.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get active problem sets to filter which problems to show
  const { data: activeSets } = await supabase
    .from("user_problem_sets")
    .select("problem_set_id")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (!activeSets || activeSets.length === 0) {
    return NextResponse.json({ problems: [] });
  }

  const setIds = activeSets.map((s) => s.problem_set_id);

  // Get problem IDs from active sets
  const { data: setItems } = await supabase
    .from("problem_set_items")
    .select("problem_id")
    .in("problem_set_id", setIds);

  if (!setItems || setItems.length === 0) {
    return NextResponse.json({ problems: [] });
  }

  const problemIds = [...new Set(setItems.map((item) => item.problem_id))];

  // Get user progress - only problems they've attempted (have a progress record)
  // We filter by status !== 'new' because 'new' means they haven't started it yet
  const { data: progressData } = await supabase
    .from("user_progress")
    .select("problem_id, next_review, status, interval")
    .eq("user_id", user.id)
    .in("problem_id", problemIds)
    .neq("status", "new"); // Only show problems user has actually worked on

  if (!progressData || progressData.length === 0) {
    return NextResponse.json({ problems: [] });
  }

  const attemptedProblemIds = progressData.map((p) => p.problem_id);

  // Get problem details for attempted problems
  const { data: problems } = await supabase
    .from("problems")
    .select("id, leetcode_id, title, difficulty, url, tags")
    .in("id", attemptedProblemIds);

  if (!problems) {
    return NextResponse.json({ problems: [] });
  }

  // Get attempt counts from review_history
  // Each row in review_history = one attempt/review of a problem
  const { data: reviewCounts } = await supabase
    .from("review_history")
    .select("problem_id")
    .eq("user_id", user.id)
    .in("problem_id", attemptedProblemIds);

  // Count attempts per problem
  const attemptCountMap = new Map<string, number>();
  for (const review of reviewCounts ?? []) {
    const current = attemptCountMap.get(review.problem_id) ?? 0;
    attemptCountMap.set(review.problem_id, current + 1);
  }

  // Create a map for quick lookup
  const progressMap = new Map(
    progressData.map((p) => [p.problem_id, p])
  );

  // Combine problem data with progress and sort by next_review
  const upcomingProblems = problems
    .map((problem) => {
      const progress = progressMap.get(problem.id);
      return {
        ...problem,
        status: progress?.status ?? "learning",
        nextReview: progress?.next_review ?? null,
        interval: progress?.interval ?? 0,
        attemptCount: attemptCountMap.get(problem.id) ?? 0,
      };
    })
    .sort((a, b) => {
      // Sort by next_review date ascending (soonest first)
      // Problems without a next_review date go to the end
      if (!a.nextReview && !b.nextReview) return 0;
      if (!a.nextReview) return 1;
      if (!b.nextReview) return -1;
      return new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime();
    });

  return NextResponse.json({ problems: upcomingProblems });
}
