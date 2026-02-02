import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { calculateNextReview, type Rating } from "@/lib/sm2";
import { calculateXP, getRank, getProgressToNextRank } from "@/lib/xp";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { problemId, rating, timeSpent, notes } = body as {
    problemId: string;
    rating: Rating;
    timeSpent?: number;
    notes?: string;
  };

  if (!problemId || !rating) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Get problem data for XP calculation (difficulty and category)
  const { data: problem } = await supabase
    .from("problems")
    .select("difficulty, tags")
    .eq("id", problemId)
    .single();

  // Get current progress
  const { data: currentProgress } = await supabase
    .from("user_progress")
    .select("ease_factor, interval, repetitions, status")
    .eq("user_id", user.id)
    .eq("problem_id", problemId)
    .single();

  // Calculate new SM-2 state
  const currentState = currentProgress
    ? {
        easeFactor: currentProgress.ease_factor,
        interval: currentProgress.interval,
        repetitions: currentProgress.repetitions,
        status: currentProgress.status as "new" | "learning" | "review" | "mastered",
      }
    : null;

  const newState = calculateNextReview(rating, currentState);

  // Update or create progress record
  const { error: progressError } = await supabase
    .from("user_progress")
    .upsert(
      {
        user_id: user.id,
        problem_id: problemId,
        ease_factor: newState.easeFactor,
        interval: newState.interval,
        repetitions: newState.repetitions,
        status: newState.status,
        next_review: newState.nextReview.toISOString(),
        last_reviewed: new Date().toISOString(),
      },
      { onConflict: "user_id,problem_id" }
    );

  if (progressError) {
    return NextResponse.json({ error: progressError.message }, { status: 500 });
  }

  // Update streak and get streak info for the response
  const streakResult = await updateStreak(supabase, user.id);

  // Calculate XP earned for this review
  const difficulty = problem?.difficulty as "Easy" | "Medium" | "Hard" | null;
  const xpEarned = calculateXP(difficulty, rating, streakResult.currentStreak);

  // Get current user XP
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp")
    .eq("id", user.id)
    .single();

  const currentXP = profile?.total_xp ?? 0;
  const newTotalXP = currentXP + xpEarned;
  const oldRank = getRank(currentXP);
  const newRank = getRank(newTotalXP);
  const rankProgress = getProgressToNextRank(newTotalXP);

  // Update total XP in profiles (use upsert in case profile doesn't exist yet)
  await supabase
    .from("profiles")
    .upsert({ id: user.id, total_xp: newTotalXP }, { onConflict: "id" });

  // Update category XP (use first tag as category, or "General" if none)
  const category = problem?.tags?.[0] ?? "General";
  const { data: categoryXP } = await supabase
    .from("user_category_xp")
    .select("xp")
    .eq("user_id", user.id)
    .eq("category", category)
    .single();

  if (categoryXP) {
    await supabase
      .from("user_category_xp")
      .update({ xp: categoryXP.xp + xpEarned })
      .eq("user_id", user.id)
      .eq("category", category);
  } else {
    await supabase.from("user_category_xp").insert({
      user_id: user.id,
      category,
      xp: xpEarned,
    });
  }

  // Insert review history with XP earned
  const { error: historyError } = await supabase.from("review_history").insert({
    user_id: user.id,
    problem_id: problemId,
    rating,
    time_spent: timeSpent ? Math.min(timeSpent, 60) : null,
    notes: notes || null,
    xp_earned: xpEarned,
  });

  if (historyError) {
    console.error("Failed to insert review history:", historyError);
  }

  return NextResponse.json({
    success: true,
    nextReview: newState.nextReview.toISOString(),
    interval: newState.interval,
    status: newState.status,
    // Streak info for showing celebration modal
    isFirstOfDay: streakResult.isFirstOfDay,
    streak: streakResult.isFirstOfDay ? {
      current: streakResult.currentStreak,
      longest: streakResult.longestStreak,
      isNewRecord: streakResult.isNewRecord,
    } : null,
    // XP info
    xp: {
      earned: xpEarned,
      total: newTotalXP,
      rank: newRank.name,
      rankColor: newRank.color,
      rankBadge: newRank.badge ?? null,
      rankUp: oldRank.name !== newRank.name ? newRank.name : null,
      progress: rankProgress.percentage,
      nextRank: rankProgress.nextRank?.name ?? null,
      xpToNext: rankProgress.nextRank ? rankProgress.requiredXP - rankProgress.progressXP : 0,
    },
  });
}

interface StreakResult {
  isFirstOfDay: boolean;
  currentStreak: number;
  longestStreak: number;
  isNewRecord: boolean;
}

async function updateStreak(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<StreakResult> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // Get current streak
  const { data: streak } = await supabase
    .from("user_streaks")
    .select("current_streak, longest_streak, last_review_date")
    .eq("user_id", userId)
    .single();

  if (!streak) {
    // Create initial streak - this is their first ever review
    await supabase.from("user_streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_review_date: todayStr,
    });
    return {
      isFirstOfDay: true,
      currentStreak: 1,
      longestStreak: 1,
      isNewRecord: true,
    };
  }

  // If already reviewed today, not the first of the day
  if (streak.last_review_date === todayStr) {
    return {
      isFirstOfDay: false,
      currentStreak: streak.current_streak,
      longestStreak: streak.longest_streak,
      isNewRecord: false,
    };
  }

  // This is the first review of the day!
  let newStreak: number;
  if (streak.last_review_date === yesterdayStr) {
    // Consecutive day - streak continues
    newStreak = streak.current_streak + 1;
  } else {
    // Streak broken - starting fresh
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, streak.longest_streak);
  const isNewRecord = newStreak > streak.longest_streak;

  await supabase
    .from("user_streaks")
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_review_date: todayStr,
    })
    .eq("user_id", userId);

  return {
    isFirstOfDay: true,
    currentStreak: newStreak,
    longestStreak: newLongest,
    isNewRecord,
  };
}
