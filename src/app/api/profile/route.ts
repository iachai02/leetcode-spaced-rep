import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Generate a random 8-character alphanumeric friend code
function generateFriendCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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

  // If profile exists but has no friend code, generate one
  let friendCode = profile?.friend_code ?? null;
  if (profile && !friendCode) {
    friendCode = generateFriendCode();
    await supabase
      .from("profiles")
      .update({ friend_code: friendCode })
      .eq("id", user.id);
  }

  // If no profile exists, create one with a friend code
  if (!profile) {
    friendCode = generateFriendCode();
    await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        friend_code: friendCode,
        daily_goal: 3,
        total_xp: 0,
        show_on_leaderboard: false,
      }, { onConflict: "id" });
  }

  return NextResponse.json({
    dailyGoal: profile?.daily_goal ?? 3,
    displayName: profile?.display_name ?? null,
    email: user.email,
    showOnLeaderboard: profile?.show_on_leaderboard ?? false,
    friendCode: friendCode,
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
  const { dailyGoal, showOnLeaderboard, displayName } = body;

  // Validate daily goal (minimum 1, maximum 20)
  if (dailyGoal !== undefined) {
    if (typeof dailyGoal !== "number" || dailyGoal < 1 || dailyGoal > 20) {
      return NextResponse.json(
        { error: "Daily goal must be between 1 and 20" },
        { status: 400 }
      );
    }
  }

  // Validate display name if provided
  if (displayName !== undefined && displayName !== null) {
    const trimmedName = displayName.trim();

    // Must be 2-30 characters
    if (trimmedName.length < 2 || trimmedName.length > 30) {
      return NextResponse.json(
        { error: "Display name must be 2-30 characters" },
        { status: 400 }
      );
    }

    // Check for uniqueness (case-insensitive)
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .ilike("display_name", trimmedName)
      .neq("id", user.id)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "This display name is already taken" },
        { status: 409 }
      );
    }
  }

  const updates: Record<string, unknown> = { id: user.id };
  if (dailyGoal !== undefined) {
    updates.daily_goal = dailyGoal;
  }
  if (showOnLeaderboard !== undefined) {
    updates.show_on_leaderboard = showOnLeaderboard;
  }
  if (displayName !== undefined) {
    updates.display_name = displayName ? displayName.trim() : null;
  }

  const { error } = await supabase
    .from("profiles")
    .upsert(updates, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
