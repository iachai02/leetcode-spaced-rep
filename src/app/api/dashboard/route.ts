import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getRank, getProgressToNextRank } from "@/lib/xp";
import { generateFriendCode } from "@/lib/friend-code";

// Helper to get the current date string in a specific timezone
function getDateInTimezone(date: Date, timezone: string): string {
  return date.toLocaleDateString("en-CA", { timeZone: timezone }); // en-CA gives YYYY-MM-DD format
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl;
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const excludeParam = url.searchParams.get("exclude") || "";
  const excludedIds = excludeParam ? excludeParam.split(",") : [];
  const timezone = url.searchParams.get("tz") || "UTC";

  // ============ GUEST MODE ============
  if (!user) {
    // Get problems from NeetCode 150 for demo
    const { data: neetcodeSet } = await supabase
      .from("problem_sets")
      .select("id")
      .eq("name", "NeetCode 150")
      .single();

    let guestProblems: Array<{
      id: string;
      leetcode_id: number | null;
      title: string;
      difficulty: string | null;
      url: string | null;
      tags: string[] | null;
      status: string;
      nextReview: null;
    }> = [];

    if (neetcodeSet) {
      const { data: setItems } = await supabase
        .from("problem_set_items")
        .select("problem_id, sort_order")
        .eq("problem_set_id", neetcodeSet.id)
        .order("sort_order", { ascending: true })
        .limit(limit);

      if (setItems && setItems.length > 0) {
        const problemIds = setItems.map((item) => item.problem_id);
        const { data: problems } = await supabase
          .from("problems")
          .select("id, leetcode_id, title, difficulty, url, tags")
          .in("id", problemIds);

        const sortOrderMap = new Map(setItems.map((item) => [item.problem_id, item.sort_order]));
        guestProblems = (problems ?? [])
          .map(p => ({ ...p, status: "new", nextReview: null }))
          .sort((a, b) => (sortOrderMap.get(a.id) ?? 0) - (sortOrderMap.get(b.id) ?? 0));
      }
    } else {
      // Fallback: get any problems
      const { data: problems } = await supabase
        .from("problems")
        .select("id, leetcode_id, title, difficulty, url, tags")
        .order("leetcode_id", { ascending: true })
        .limit(limit);

      guestProblems = (problems ?? []).map(p => ({ ...p, status: "new", nextReview: null }));
    }

    return NextResponse.json({
      isGuest: true,
      problems: guestProblems,
      hasMoreProblems: true,
      profile: {
        dailyGoal: 3,
        displayName: null,
        email: null,
        showOnLeaderboard: false,
        friendCode: null,
        totalXP: 0,
      },
      stats: null,
      upcomingProblems: [],
    });
  }

  // ============ SIGNED-IN USER ============
  // Run all independent queries in parallel
  const todayStr = getDateInTimezone(new Date(), timezone);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  oneYearAgo.setHours(0, 0, 0, 0);

  const [
    profileResult,
    streakResult,
    activeSetsResult,
    activityReviewsResult,
    masteredResult,
    inProgressResult,
    totalReviewsResult,
  ] = await Promise.all([
    // Profile
    supabase.from("profiles").select("daily_goal, display_name, show_on_leaderboard, friend_code, total_xp").eq("id", user.id).single(),
    // Streak
    supabase.from("user_streaks").select("current_streak, longest_streak, last_review_date").eq("user_id", user.id).single(),
    // Active problem sets
    supabase.from("user_problem_sets").select("problem_set_id").eq("user_id", user.id).eq("is_active", true),
    // Activity reviews (last year for heatmap)
    supabase.from("review_history").select("reviewed_at").eq("user_id", user.id).gte("reviewed_at", oneYearAgo.toISOString()),
    // Mastered problems
    supabase.from("user_progress").select("id").eq("user_id", user.id).eq("status", "mastered"),
    // In-progress problems
    supabase.from("user_progress").select("id, status").eq("user_id", user.id).in("status", ["learning", "review"]),
    // Total reviews count
    supabase.from("review_history").select("*", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const profile = profileResult.data;
  const streak = streakResult.data;
  const activeSets = activeSetsResult.data;
  const activityReviews = activityReviewsResult.data;
  const mastered = masteredResult.data;
  const inProgress = inProgressResult.data;
  const totalReviews = totalReviewsResult.count;

  // Handle profile creation/friend code generation
  let friendCode = profile?.friend_code ?? null;
  if (profile && !friendCode) {
    friendCode = generateFriendCode();
    await supabase.from("profiles").update({ friend_code: friendCode }).eq("id", user.id);
  }
  if (!profile) {
    friendCode = generateFriendCode();
    await supabase.from("profiles").upsert({
      id: user.id,
      friend_code: friendCode,
      daily_goal: 3,
      total_xp: 0,
      show_on_leaderboard: true,
    }, { onConflict: "id" });
  }

  const dailyGoal = profile?.daily_goal ?? 3;
  const totalXP = profile?.total_xp ?? 0;

  // ============ CALCULATE STATS ============
  // Count activity by day in user's timezone
  const activityMap: Record<string, number> = {};
  for (const r of activityReviews ?? []) {
    const reviewDate = new Date(r.reviewed_at);
    const dateStr = getDateInTimezone(reviewDate, timezone);
    activityMap[dateStr] = (activityMap[dateStr] ?? 0) + 1;
  }
  const activityValues = Object.values(activityMap);
  const maxActivityCount = activityValues.length > 0 ? Math.max(...activityValues) : 0;

  // Calculate reviewed today from activity map
  const reviewedToday = activityMap[todayStr] ?? 0;

  // Calculate weekly activity
  const now = new Date();
  const nowInTz = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  const dayOfWeek = nowInTz.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyActivity = weekDays.map((day, index) => {
    const dayDate = new Date(now.getTime() + (mondayOffset + index) * 24 * 60 * 60 * 1000);
    const dateStr = getDateInTimezone(dayDate, timezone);
    const isToday = dateStr === todayStr;
    const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const isFuture = index > todayIndex;
    return {
      day,
      date: dateStr,
      completed: activityMap[dateStr] ? activityMap[dateStr] > 0 : false,
      count: activityMap[dateStr] ?? 0,
      isToday,
      isFuture,
    };
  });

  // Calculate rank info
  const rank = getRank(totalXP);
  const rankProgress = getProgressToNextRank(totalXP);

  const learning = inProgress?.filter((p) => p.status === "learning").length ?? 0;
  const review = inProgress?.filter((p) => p.status === "review").length ?? 0;

  // ============ GET PROBLEMS (QUEUE + UPCOMING) ============
  let problems: Array<{
    id: string;
    leetcode_id: number | null;
    title: string;
    difficulty: string | null;
    url: string | null;
    tags: string[] | null;
    status: string;
    nextReview: string | null;
  }> = [];
  let hasMoreProblems = false;
  let upcomingProblems: Array<{
    id: string;
    leetcode_id: number | null;
    title: string;
    difficulty: string | null;
    url: string | null;
    tags: string[] | null;
    status: string;
    nextReview: string | null;
    interval: number;
    attemptCount: number;
  }> = [];

  if (activeSets && activeSets.length > 0) {
    const setIds = activeSets.map((s) => s.problem_set_id);

    // Get problem set items
    const { data: setItems } = await supabase
      .from("problem_set_items")
      .select("problem_id, sort_order")
      .in("problem_set_id", setIds);

    if (setItems && setItems.length > 0) {
      const problemIds = [...new Set(setItems.map((item) => item.problem_id))];

      // Run these queries in parallel
      const [progressResult, problemsResult, reviewCountsResult] = await Promise.all([
        supabase.from("user_progress").select("problem_id, next_review, status, interval").eq("user_id", user.id).in("problem_id", problemIds),
        supabase.from("problems").select("id, leetcode_id, title, difficulty, url, tags").in("id", problemIds),
        supabase.from("review_history").select("problem_id").eq("user_id", user.id).in("problem_id", problemIds),
      ]);

      const progressData = progressResult.data;
      const allProblems = problemsResult.data;
      const reviewCounts = reviewCountsResult.data;

      if (allProblems) {
        // Build maps
        const sortOrderMap = new Map<string, number>();
        for (const item of setItems) {
          const current = sortOrderMap.get(item.problem_id);
          if (current === undefined || item.sort_order < current) {
            sortOrderMap.set(item.problem_id, item.sort_order);
          }
        }

        const progressMap = new Map(progressData?.map((p) => [p.problem_id, p]) ?? []);

        const attemptCountMap = new Map<string, number>();
        for (const r of reviewCounts ?? []) {
          attemptCountMap.set(r.problem_id, (attemptCountMap.get(r.problem_id) ?? 0) + 1);
        }

        // ============ BUILD QUEUE ============
        const queueNow = new Date();
        const queueProblems = allProblems
          .map((problem) => {
            const progress = progressMap.get(problem.id);
            const nextReview = progress?.next_review ? new Date(progress.next_review) : null;
            const status = progress?.status ?? "new";
            const sortOrder = sortOrderMap.get(problem.id) ?? Infinity;
            const isNew = !progress;
            const isOverdue = nextReview && nextReview <= queueNow;
            let urgency = 0;
            if (nextReview) {
              urgency = nextReview.getTime() - queueNow.getTime();
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
            if (a.isOverdue && !b.isOverdue) return -1;
            if (!a.isOverdue && b.isOverdue) return 1;
            if (a.isOverdue && b.isOverdue) {
              if (a.urgency !== b.urgency) return a.urgency - b.urgency;
              return a.sortOrder - b.sortOrder;
            }
            if (a.isNew && !b.isNew) return -1;
            if (!a.isNew && b.isNew) return 1;
            if (a.isNew && b.isNew) {
              return a.sortOrder - b.sortOrder;
            }
            return a.sortOrder - b.sortOrder;
          });

        const totalAvailable = allProblems.filter((p) => !excludedIds.includes(p.id)).length;
        hasMoreProblems = totalAvailable > limit;

        problems = queueProblems.slice(0, limit).map((p) => ({
          id: p.id,
          leetcode_id: p.leetcode_id,
          title: p.title,
          difficulty: p.difficulty,
          url: p.url,
          tags: p.tags,
          status: p.status,
          nextReview: p.nextReview,
        }));

        // ============ BUILD UPCOMING ============
        upcomingProblems = allProblems
          .filter((problem) => {
            const progress = progressMap.get(problem.id);
            return progress && progress.status !== "new";
          })
          .map((problem) => {
            const progress = progressMap.get(problem.id)!;
            return {
              ...problem,
              status: progress.status ?? "learning",
              nextReview: progress.next_review ?? null,
              interval: progress.interval ?? 0,
              attemptCount: attemptCountMap.get(problem.id) ?? 0,
            };
          })
          .sort((a, b) => {
            if (!a.nextReview && !b.nextReview) return 0;
            if (!a.nextReview) return 1;
            if (!b.nextReview) return -1;
            return new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime();
          });
      }
    }
  }

  return NextResponse.json({
    isGuest: false,
    problems,
    hasMoreProblems,
    profile: {
      dailyGoal,
      displayName: profile?.display_name ?? null,
      email: user.email,
      showOnLeaderboard: profile?.show_on_leaderboard ?? false,
      friendCode,
      totalXP,
    },
    stats: {
      currentStreak: streak?.current_streak ?? 0,
      longestStreak: streak?.longest_streak ?? 0,
      lastReviewDate: streak?.last_review_date ?? null,
      reviewedToday,
      dailyGoal,
      mastered: mastered?.length ?? 0,
      learning,
      review,
      totalReviews: totalReviews ?? 0,
      activity: activityMap,
      maxActivityCount,
      weeklyActivity,
      xp: {
        total: totalXP,
        rank: rank.name,
        rankColor: rank.color,
        rankBadge: rank.badge ?? null,
        progress: rankProgress.percentage,
        nextRank: rankProgress.nextRank?.name ?? null,
        xpToNext: rankProgress.nextRank ? rankProgress.requiredXP - rankProgress.progressXP : 0,
        progressXP: rankProgress.progressXP,
        requiredXP: rankProgress.requiredXP,
      },
    },
    upcomingProblems,
  });
}
