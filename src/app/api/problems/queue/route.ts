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
  // Priority order:
  // 1. Overdue problems (need review, sorted by how overdue they are)
  // 2. New problems (never attempted, sorted by curriculum order)
  // 3. Non-due problems (already reviewed, sorted by curriculum order for extra practice)
  const now = new Date();
  const allProblems = problems
    .map((problem) => {
      const progress = progressMap.get(problem.id);
      const nextReview = progress?.next_review
        ? new Date(progress.next_review)
        : null;
      const status = progress?.status ?? "new";
      const sortOrder = sortOrderMap.get(problem.id) ?? Infinity;
      const isNew = !progress; // Never attempted = no progress record
      const isOverdue = nextReview && nextReview <= now;

      // Calculate urgency for overdue problems (more negative = more overdue)
      let urgency = 0;
      if (nextReview) {
        urgency = nextReview.getTime() - now.getTime();
      }

      return {
        ...problem,
        status,
        nextReview: progress?.next_review ?? null,
        urgency,
        sortOrder,
        isNew,
        isOverdue,
      };
    })
    .filter((p) => !excludedIds.includes(p.id))
    .sort((a, b) => {
      // 1. Overdue problems first (sorted by how overdue - most overdue first)
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      if (a.isOverdue && b.isOverdue) {
        // Both overdue - more negative urgency = more overdue = higher priority
        if (a.urgency !== b.urgency) return a.urgency - b.urgency;
        return a.sortOrder - b.sortOrder;
      }

      // 2. New problems second (sorted by curriculum order)
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      if (a.isNew && b.isNew) {
        return a.sortOrder - b.sortOrder;
      }

      // 3. Non-due problems last (sorted by curriculum order for consistent experience)
      return a.sortOrder - b.sortOrder;
    })
    .slice(0, limit);

  // Check if there are more problems beyond what we're returning
  const totalAvailable = problems.filter((p) => !excludedIds.includes(p.id)).length;
  const hasMoreProblems = totalAvailable > limit;

  return NextResponse.json({
    problems: allProblems,
    dailyGoal,
    reviewedToday,
    hasMoreProblems,
  });
}
