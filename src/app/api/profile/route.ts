import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_goal, display_name, show_on_leaderboard, friend_code, total_xp")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    dailyGoal: profile?.daily_goal ?? 3,
    displayName: profile?.display_name ?? null,
    email: user.email,
    showOnLeaderboard: profile?.show_on_leaderboard ?? false,
    friendCode: profile?.friend_code ?? null,
    totalXP: profile?.total_xp ?? 0,
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { dailyGoal, showOnLeaderboard } = body;

  // Validate daily goal (minimum 1, maximum 20)
  if (dailyGoal !== undefined) {
    if (typeof dailyGoal !== "number" || dailyGoal < 1 || dailyGoal > 20) {
      return NextResponse.json(
        { error: "Daily goal must be between 1 and 20" },
        { status: 400 }
      );
    }
  }

  const updates: Record<string, unknown> = {};
  if (dailyGoal !== undefined) {
    updates.daily_goal = dailyGoal;
  }
  if (showOnLeaderboard !== undefined) {
    updates.show_on_leaderboard = showOnLeaderboard;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
