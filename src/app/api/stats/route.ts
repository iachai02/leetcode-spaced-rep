import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

  // Get daily goal
  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_goal")
    .eq("id", user.id)
    .single();

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
  });
}
