import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { problemId, problemSetId } = body as {
    problemId?: string;
    problemSetId?: string;
  };

  if (!problemId && !problemSetId) {
    return NextResponse.json(
      { error: "Must provide problemId or problemSetId" },
      { status: 400 }
    );
  }

  if (problemId) {
    // Reset single problem
    const { error } = await supabase
      .from("user_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("problem_id", problemId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, reset: 1 });
  }

  if (problemSetId) {
    // Get all problems in the set
    const { data: setItems } = await supabase
      .from("problem_set_items")
      .select("problem_id")
      .eq("problem_set_id", problemSetId);

    if (!setItems || setItems.length === 0) {
      return NextResponse.json({ success: true, reset: 0 });
    }

    const problemIds = setItems.map((item) => item.problem_id);

    // Delete all progress for these problems
    const { error } = await supabase
      .from("user_progress")
      .delete()
      .eq("user_id", user.id)
      .in("problem_id", problemIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, reset: problemIds.length });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
