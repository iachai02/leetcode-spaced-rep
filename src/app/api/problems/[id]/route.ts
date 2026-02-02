import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get problem
  const { data: problem, error: problemError } = await supabase
    .from("problems")
    .select("id, leetcode_id, title, difficulty, url, tags")
    .eq("id", id)
    .single();

  if (problemError || !problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  // Get user's progress for this problem
  const { data: progress } = await supabase
    .from("user_progress")
    .select("ease_factor, interval, repetitions, status")
    .eq("user_id", user.id)
    .eq("problem_id", id)
    .single();

  return NextResponse.json({
    problem,
    progress,
  });
}
