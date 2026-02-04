import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getRank, getProgressToNextRank } from "@/lib/xp";

// Helper to get the current date string in a specific timezone
function getDateInTimezone(date: Date, timezone: string): string {
  return date.toLocaleDateString("en-CA", { timeZone: timezone }); // en-CA gives YYYY-MM-DD format
}

// Helper to get start of day in a specific timezone as UTC
function getStartOfDayInTimezone(timezone: string): Date {
  const now = new Date();
  const dateStr = getDateInTimezone(now, timezone);
  // Create a date at midnight in the target timezone
  // by parsing the date string and adjusting for timezone offset
  const localMidnight = new Date(dateStr + "T00:00:00");
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  // Get the timezone offset by comparing local midnight to UTC
  const parts = formatter.formatToParts(localMidnight);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || "0";
  const tzDate = new Date(
    `${getPart("year")}-${getPart("month")}-${getPart("day")}T${getPart("hour")}:${getPart("minute")}:${getPart("second")}`
  );
  const offset = localMidnight.getTime() - tzDate.getTime();
  return new Date(localMidnight.getTime() + offset);
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get timezone from query params, default to UTC
  const timezone = request.nextUrl.searchParams.get("tz") || "UTC";

  // Get streak data
  const { data: streak } = await supabase
    .from("user_streaks")
    .select("current_streak, longest_streak, last_review_date")
    .eq("user_id", user.id)
    .single();

  // Get problems reviewed today (in user's timezone)
  const todayStart = getStartOfDayInTimezone(timezone);
  const todayStr = getDateInTimezone(new Date(), timezone);

  const { data: todayReviews } = await supabase
    .from("review_history")
    .select("id")
    .eq("user_id", user.id)
    .gte("reviewed_at", todayStart.toISOString());

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
  // Convert each review timestamp to the user's timezone before grouping
  const activityMap: Record<string, number> = {};
  for (const r of activityReviews ?? []) {
    const reviewDate = new Date(r.reviewed_at);
    const dateStr = getDateInTimezone(reviewDate, timezone);
    activityMap[dateStr] = (activityMap[dateStr] ?? 0) + 1;
  }
  const activityValues = Object.values(activityMap);
  const maxActivityCount = activityValues.length > 0 ? Math.max(...activityValues) : 0;

  // Calculate weekly activity (Mon-Sun for current week)
  // Week starts on Monday (ISO standard)
  // Use the user's timezone to determine which day of the week it is
  const now = new Date();
  const nowInTz = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  const dayOfWeek = nowInTz.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;


  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyActivity = weekDays.map((day, index) => {
    // Calculate the date for this day of the week
    const dayDate = new Date(now.getTime() + (mondayOffset + index) * 24 * 60 * 60 * 1000);
    const dateStr = getDateInTimezone(dayDate, timezone);
    const isToday = dateStr === todayStr;
    // A day is in the future if its index is greater than today's position in the week
    const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Mon=0, Sun=6
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
