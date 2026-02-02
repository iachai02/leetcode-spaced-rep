import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getRank } from "@/lib/xp";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "global"; // 'global' or 'friends'
  const limit = parseInt(url.searchParams.get("limit") || "50");

  if (type === "friends") {
    // Friends leaderboard requires authentication
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's accepted friends
    const { data: friendships } = await supabase
      .from("friends")
      .select("user_id, friend_id")
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq("status", "accepted");

    // Extract friend IDs
    const friendIds = new Set<string>();
    friendIds.add(user.id); // Include self in friends leaderboard
    for (const f of friendships ?? []) {
      if (f.user_id === user.id) {
        friendIds.add(f.friend_id);
      } else {
        friendIds.add(f.user_id);
      }
    }

    if (friendIds.size === 0) {
      return NextResponse.json({
        leaderboard: [],
        userRank: null,
        totalUsers: 0,
      });
    }

    // Get profiles for friends (including self)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, total_xp")
      .in("id", Array.from(friendIds))
      .order("total_xp", { ascending: false })
      .limit(limit);

    // Get streak data for these users
    const { data: streaks } = await supabase
      .from("user_streaks")
      .select("user_id, current_streak")
      .in("user_id", Array.from(friendIds));

    const streakMap = new Map(
      streaks?.map((s) => [s.user_id, s.current_streak]) ?? []
    );

    // Build leaderboard with ranks
    const leaderboard = (profiles ?? []).map((profile, index) => {
      const rank = getRank(profile.total_xp ?? 0);
      return {
        position: index + 1,
        userId: profile.id,
        displayName: profile.display_name || "Anonymous",
        totalXP: profile.total_xp ?? 0,
        rankName: rank.name,
        rankColor: rank.color,
        rankBadge: rank.badge ?? null,
        streak: streakMap.get(profile.id) ?? 0,
        isCurrentUser: profile.id === user.id,
      };
    });

    // Find user's position
    const userRank = leaderboard.find((l) => l.isCurrentUser)?.position ?? null;

    return NextResponse.json({
      leaderboard,
      userRank,
      totalUsers: leaderboard.length,
    });
  }

  // Global leaderboard - only show users who opted in
  const { data: profiles, count } = await supabase
    .from("profiles")
    .select("id, display_name, total_xp", { count: "exact" })
    .eq("show_on_leaderboard", true)
    .order("total_xp", { ascending: false })
    .limit(limit);

  // Get streak data for leaderboard users
  const userIds = (profiles ?? []).map((p) => p.id);
  const { data: streaks } = await supabase
    .from("user_streaks")
    .select("user_id, current_streak")
    .in("user_id", userIds);

  const streakMap = new Map(
    streaks?.map((s) => [s.user_id, s.current_streak]) ?? []
  );

  // Build leaderboard
  const leaderboard = (profiles ?? []).map((profile, index) => {
    const rank = getRank(profile.total_xp ?? 0);
    return {
      position: index + 1,
      userId: profile.id,
      displayName: profile.display_name || "Anonymous",
      totalXP: profile.total_xp ?? 0,
      rankName: rank.name,
      rankColor: rank.color,
      rankBadge: rank.badge ?? null,
      streak: streakMap.get(profile.id) ?? 0,
      isCurrentUser: user ? profile.id === user.id : false,
    };
  });

  // If user is logged in, get their global rank (even if not on leaderboard)
  let userRank = null;
  if (user) {
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("total_xp, show_on_leaderboard")
      .eq("id", user.id)
      .single();

    if (userProfile?.show_on_leaderboard) {
      // Count how many users have more XP
      const { count: usersAbove } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("show_on_leaderboard", true)
        .gt("total_xp", userProfile.total_xp ?? 0);

      userRank = (usersAbove ?? 0) + 1;
    }
  }

  return NextResponse.json({
    leaderboard,
    userRank,
    totalUsers: count ?? 0,
  });
}
