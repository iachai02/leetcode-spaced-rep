import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "3");

  // Guest mode: return sample problems without user-specific progress
  // This lets guests try the app before signing in
  if (!user) {
    // Get problems from NeetCode 150 (a good default set for demo)
    const { data: neetcodeSet } = await supabase
      .from("problem_sets")
      .select("id")
      .eq("name", "NeetCode 150")
      .single();

    if (!neetcodeSet) {
      // Fallback: just get any problems
      const { data: problems } = await supabase
        .from("problems")
        .select("id, leetcode_id, title, difficulty, url, tags")
        .order("leetcode_id", { ascending: true })
        .limit(limit);

      return NextResponse.json({
        problems: (problems ?? []).map(p => ({ ...p, status: "new", nextReview: null })),
        dailyGoal: 3,
        reviewedToday: 0,
        hasMoreProblems: true,
        isGuest: true,
      });
    }

    // Get problems from NeetCode 150 in curriculum order
    const { data: setItems } = await supabase
      .from("problem_set_items")
      .select("problem_id, sort_order")
      .eq("problem_set_id", neetcodeSet.id)
      .order("sort_order", { ascending: true })
      .limit(limit);

    if (!setItems || setItems.length === 0) {
      return NextResponse.json({
        problems: [],
        dailyGoal: 3,
        reviewedToday: 0,
        hasMoreProblems: false,
        isGuest: true,
      });
    }

    const problemIds = setItems.map((item) => item.problem_id);

    const { data: problems } = await supabase
      .from("problems")
      .select("id, leetcode_id, title, difficulty, url, tags")
      .in("id", problemIds);

    // Sort problems by the curriculum order from setItems
    const sortOrderMap = new Map(setItems.map((item) => [item.problem_id, item.sort_order]));
    const sortedProblems = (problems ?? [])
      .map(p => ({ ...p, status: "new", nextReview: null }))
      .sort((a, b) => (sortOrderMap.get(a.id) ?? 0) - (sortOrderMap.get(b.id) ?? 0));

    return NextResponse.json({
      problems: sortedProblems,
      dailyGoal: 3,
      reviewedToday: 0,
      hasMoreProblems: true,
      isGuest: true,
    });
  }

  // Get excluded (skipped) problem IDs - these are problems the user
  // doesn't want to see right now, but should still come back when due
  const excludeParam = url.searchParams.get("exclude") || "";
  const excludedIds = excludeParam ? excludeParam.split(",") : [];

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

  // Get problems from active sets with sort_order
  const { data: setItems } = await supabase
    .from("problem_set_items")
    .select("problem_id, sort_order")
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

  // Create a map of problem_id -> minimum sort_order (for problems in multiple sets)
  const sortOrderMap = new Map<string, number>();
  for (const item of setItems) {
    const current = sortOrderMap.get(item.problem_id);
    if (current === undefined || item.sort_order < current) {
      sortOrderMap.set(item.problem_id, item.sort_order);
    }
  }

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
      const sortOrder = sortOrderMap.get(problem.id) ?? Infinity;

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
        sortOrder,
        isDue: status === "new" || (nextReview && nextReview <= now),
      };
    })
    .filter((p) => p.isDue && !excludedIds.includes(p.id))
    .sort((a, b) => {
      // Primary sort by urgency
      if (a.urgency !== b.urgency) {
        // Handle -Infinity comparison
        if (a.urgency === -Infinity && b.urgency === -Infinity) {
          // Both are new, use sort_order
          return a.sortOrder - b.sortOrder;
        }
        return a.urgency - b.urgency;
      }
      // Secondary sort by sort_order (curriculum order)
      return a.sortOrder - b.sortOrder;
    })
    .slice(0, limit);

  // Check if there are more due problems beyond what we're returning
  // (excluding skipped ones from the count)
  const hasMoreProblems = problems.filter((p) => {
    if (excludedIds.includes(p.id)) return false;
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
