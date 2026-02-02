import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getRank } from "@/lib/xp";

// Generate a random 8-character alphanumeric friend code
function generateFriendCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET - List friends and pending requests
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's friend code first (needed in all responses)
  const { data: profile } = await supabase
    .from("profiles")
    .select("friend_code")
    .eq("id", user.id)
    .single();

  // Generate friend code if missing
  let friendCode = profile?.friend_code ?? null;
  if (!friendCode) {
    friendCode = generateFriendCode();
    await supabase
      .from("profiles")
      .upsert({ id: user.id, friend_code: friendCode }, { onConflict: "id" });
  }

  // Get all friend relationships
  const { data: friendships } = await supabase
    .from("friends")
    .select("id, user_id, friend_id, status, created_at")
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

  if (!friendships || friendships.length === 0) {
    return NextResponse.json({
      friends: [],
      pendingReceived: [],
      pendingSent: [],
      friendCode,
    });
  }

  // Collect all user IDs we need to fetch profiles for
  const userIds = new Set<string>();
  for (const f of friendships) {
    userIds.add(f.user_id);
    userIds.add(f.friend_id);
  }
  userIds.delete(user.id);

  // Fetch profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, total_xp")
    .in("id", Array.from(userIds));

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

  // Categorize friendships
  const friends: Array<{
    friendshipId: string;
    odisplayName: string;
    totalXP: number;
    rankName: string;
    rankColor: string;
  }> = [];
  const pendingReceived: Array<{
    friendshipId: string;
    userId: string;
    displayName: string;
    createdAt: string;
  }> = [];
  const pendingSent: Array<{
    friendshipId: string;
    userId: string;
    displayName: string;
    createdAt: string;
  }> = [];

  for (const f of friendships) {
    const otherId = f.user_id === user.id ? f.friend_id : f.user_id;
    const otherProfile = profileMap.get(otherId);
    const rank = getRank(otherProfile?.total_xp ?? 0);

    if (f.status === "accepted") {
      friends.push({
        friendshipId: f.id,
        odisplayName: otherProfile?.display_name || "Anonymous",
        totalXP: otherProfile?.total_xp ?? 0,
        rankName: rank.name,
        rankColor: rank.color,
      });
    } else if (f.status === "pending") {
      if (f.friend_id === user.id) {
        // Request received
        pendingReceived.push({
          friendshipId: f.id,
          userId: f.user_id,
          displayName: otherProfile?.display_name || "Anonymous",
          createdAt: f.created_at,
        });
      } else {
        // Request sent
        pendingSent.push({
          friendshipId: f.id,
          userId: f.friend_id,
          displayName: otherProfile?.display_name || "Anonymous",
          createdAt: f.created_at,
        });
      }
    }
  }

  return NextResponse.json({
    friends,
    pendingReceived,
    pendingSent,
    friendCode,
  });
}

// POST - Send friend request
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { friendCode, email } = body as {
    friendCode?: string;
    email?: string;
  };

  if (!friendCode && !email) {
    return NextResponse.json(
      { error: "Friend code or email required" },
      { status: 400 }
    );
  }

  // Find the friend by code or email
  let friendId: string | null = null;

  if (friendCode) {
    const { data: friendProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("friend_code", friendCode.toUpperCase())
      .single();

    friendId = friendProfile?.id ?? null;
  } else if (email) {
    // Look up user by email in auth.users (need admin access or different approach)
    // For now, we'll search by display_name which might contain the email
    // In production, you'd want a proper email lookup
    const { data: friendProfile } = await supabase
      .from("profiles")
      .select("id, display_name")
      .ilike("display_name", `%${email}%`)
      .single();

    friendId = friendProfile?.id ?? null;
  }

  if (!friendId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (friendId === user.id) {
    return NextResponse.json(
      { error: "Cannot add yourself as a friend" },
      { status: 400 }
    );
  }

  // Check if friendship already exists
  const { data: existing } = await supabase
    .from("friends")
    .select("id, status")
    .or(
      `and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`
    )
    .single();

  if (existing) {
    if (existing.status === "accepted") {
      return NextResponse.json(
        { error: "Already friends" },
        { status: 400 }
      );
    }
    if (existing.status === "pending") {
      return NextResponse.json(
        { error: "Friend request already pending" },
        { status: 400 }
      );
    }
  }

  // Create friend request
  const { error } = await supabase.from("friends").insert({
    user_id: user.id,
    friend_id: friendId,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PATCH - Accept or reject friend request
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { friendshipId, action } = body as {
    friendshipId: string;
    action: "accept" | "reject";
  };

  if (!friendshipId || !action) {
    return NextResponse.json(
      { error: "Friendship ID and action required" },
      { status: 400 }
    );
  }

  // Verify the request is for the current user
  const { data: friendship } = await supabase
    .from("friends")
    .select("friend_id")
    .eq("id", friendshipId)
    .single();

  if (!friendship || friendship.friend_id !== user.id) {
    return NextResponse.json(
      { error: "Cannot modify this friend request" },
      { status: 403 }
    );
  }

  if (action === "accept") {
    const { error } = await supabase
      .from("friends")
      .update({ status: "accepted" })
      .eq("id", friendshipId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    // Reject = delete the request
    const { error } = await supabase
      .from("friends")
      .delete()
      .eq("id", friendshipId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

// DELETE - Remove friend
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const friendshipId = url.searchParams.get("id");

  if (!friendshipId) {
    return NextResponse.json(
      { error: "Friendship ID required" },
      { status: 400 }
    );
  }

  // Verify user is part of this friendship
  const { data: friendship } = await supabase
    .from("friends")
    .select("user_id, friend_id")
    .eq("id", friendshipId)
    .single();

  if (
    !friendship ||
    (friendship.user_id !== user.id && friendship.friend_id !== user.id)
  ) {
    return NextResponse.json(
      { error: "Cannot remove this friend" },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("friends")
    .delete()
    .eq("id", friendshipId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
