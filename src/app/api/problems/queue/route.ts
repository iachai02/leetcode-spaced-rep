import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "3");

  // Get user's daily goal
  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_goal")
    .eq("id", user.id)
    .single();

  const dailyGoal = profile?.daily_goal ?? 3;

  // Get active problem sets
  const { data: activeSets } = await supabase
    .from("user_problem_sets")
    .select("problem_set_id")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (!activeSets || activeSets.length === 0) {
    return NextResponse.json({
      problems: [],
      dailyGoal,
      reviewedToday: 0,
      hasMoreProblems: false,
    });
  }

  const setIds = activeSets.map((s) => s.problem_set_id);

  // Get problems from active sets
  const { data: setItems } = await supabase
    .from("problem_set_items")
    .select("problem_id")
    .in("problem_set_id", setIds);

  if (!setItems || setItems.length === 0) {
    return NextResponse.json({
      problems: [],
      dailyGoal,
      reviewedToday: 0,
      hasMoreProblems: false,
    });
  }

  const problemIds = setItems.map((item) => item.problem_id);

  // Get user progress for these problems
  const { data: progressData } = await supabase
    .from("user_progress")
    .select("problem_id, next_review, status")
    .eq("user_id", user.id)
    .in("problem_id", problemIds);

  const progressMap = new Map(
    progressData?.map((p) => [p.problem_id, p]) ?? []
  );

  // Get problems reviewed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayReviews } = await supabase
    .from("review_history")
    .select("id")
    .eq("user_id", user.id)
    .gte("reviewed_at", today.toISOString());

  const reviewedToday = todayReviews?.length ?? 0;

  // Get all problems
  const { data: problems } = await supabase
    .from("problems")
    .select("id, leetcode_id, title, difficulty, url, tags")
    .in("id", problemIds);

  if (!problems) {
    return NextResponse.json({
      problems: [],
      dailyGoal,
      reviewedToday,
      hasMoreProblems: false,
    });
  }

  // Filter and sort problems
  const now = new Date();
  const dueProblems = problems
    .map((problem) => {
      const progress = progressMap.get(problem.id);
      const nextReview = progress?.next_review
        ? new Date(progress.next_review)
        : null;
      const status = progress?.status ?? "new";

      // Calculate urgency (negative = overdue, positive = not yet due)
      let urgency = 0;
      if (status === "new") {
        urgency = -Infinity; // New problems have highest priority
      } else if (nextReview) {
        urgency = nextReview.getTime() - now.getTime();
      }

      return {
        ...problem,
        status,
        nextReview: progress?.next_review ?? null,
        urgency,
        isDue: status === "new" || (nextReview && nextReview <= now),
      };
    })
    .filter((p) => p.isDue)
    .sort((a, b) => a.urgency - b.urgency)
    .slice(0, limit);

  const hasMoreProblems = problems.filter((p) => {
    const progress = progressMap.get(p.id);
    const status = progress?.status ?? "new";
    const nextReview = progress?.next_review
      ? new Date(progress.next_review)
      : null;
    return status === "new" || (nextReview && nextReview <= now);
  }).length > limit;

  return NextResponse.json({
    problems: dueProblems,
    dailyGoal,
    reviewedToday,
    hasMoreProblems,
  });
}
