import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getRank, getProgressToNextRank } from "@/lib/xp";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get streak data
  const { data: streak } = await supabase
    .from("user_streaks")
    .select("current_streak, longest_streak, last_review_date")
    .eq("user_id", user.id)
    .single();

  // Get problems reviewed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayReviews } = await supabase
    .from("review_history")
    .select("id")
    .eq("user_id", user.id)
    .gte("reviewed_at", today.toISOString());

  // Get total problems mastered
  const { data: mastered } = await supabase
    .from("user_progress")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "mastered");

  // Get total problems in learning/review
  const { data: inProgress } = await supabase
    .from("user_progress")
    .select("id, status")
    .eq("user_id", user.id)
    .in("status", ["learning", "review"]);

  const learning = inProgress?.filter((p) => p.status === "learning").length ?? 0;
  const review = inProgress?.filter((p) => p.status === "review").length ?? 0;

  // Get total reviews all time
  const { count: totalReviews } = await supabase
    .from("review_history")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get daily goal and XP
  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_goal, total_xp")
    .eq("id", user.id)
    .single();

  // Calculate rank info
  const totalXP = profile?.total_xp ?? 0;
  const rank = getRank(totalXP);
  const rankProgress = getProgressToNextRank(totalXP);

  // Get activity data for heatmap (last 365 days)
  // We fetch reviewed_at dates and count them server-side
  // This is faster than having the heatmap component make a separate request
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  oneYearAgo.setHours(0, 0, 0, 0);

  const { data: activityReviews } = await supabase
    .from("review_history")
    .select("reviewed_at")
    .eq("user_id", user.id)
    .gte("reviewed_at", oneYearAgo.toISOString());

  // Count reviews per day (server-side aggregation)
  const activityMap: Record<string, number> = {};
  for (const r of activityReviews ?? []) {
    const date = r.reviewed_at.split("T")[0];
    activityMap[date] = (activityMap[date] ?? 0) + 1;
  }
  const maxActivityCount = Math.max(...Object.values(activityMap), 0);

  // Calculate weekly activity (Mon-Sun for current week)
  // Week starts on Monday (ISO standard)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyActivity = weekDays.map((day, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateStr = date.toISOString().split("T")[0];
    const isToday = dateStr === today.toISOString().split("T")[0];
    const isFuture = date > now;
    return {
      day,
      date: dateStr,
      completed: activityMap[dateStr] ? activityMap[dateStr] > 0 : false,
      count: activityMap[dateStr] ?? 0,
      isToday,
      isFuture,
    };
  });

  return NextResponse.json({
    currentStreak: streak?.current_streak ?? 0,
    longestStreak: streak?.longest_streak ?? 0,
    lastReviewDate: streak?.last_review_date ?? null,
    reviewedToday: todayReviews?.length ?? 0,
    dailyGoal: profile?.daily_goal ?? 3,
    mastered: mastered?.length ?? 0,
    learning,
    review,
    totalReviews: totalReviews ?? 0,
    // Activity data for heatmap - included here to avoid separate fetch
    activity: activityMap,
    maxActivityCount,
    // Weekly activity for streak modal
    weeklyActivity,
    // XP and rank data
    xp: {
      total: totalXP,
      rank: rank.name,
      rankColor: rank.color,
      rankBadge: rank.badge ?? null,
      progress: rankProgress.percentage,
      nextRank: rankProgress.nextRank?.name ?? null,
      xpToNext: rankProgress.nextRank
        ? rankProgress.requiredXP - rankProgress.progressXP
        : 0,
      progressXP: rankProgress.progressXP,
      requiredXP: rankProgress.requiredXP,
    },
  });
}
