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

  // Get the problem set
  const { data: problemSet, error: setError } = await supabase
    .from("problem_sets")
    .select("id, name, description, is_preset")
    .eq("id", id)
    .single();

  if (setError || !problemSet) {
    return NextResponse.json({ error: "Problem set not found" }, { status: 404 });
  }

  // Get problems in the set
  const { data: setItems } = await supabase
    .from("problem_set_items")
    .select(`
      problem_id,
      sort_order,
      problems (
        id,
        leetcode_id,
        title,
        difficulty,
        url,
        tags
      )
    `)
    .eq("problem_set_id", id)
    .order("sort_order");

  // Get user progress for these problems
  const problemIds = setItems?.map((item) => item.problem_id) ?? [];

  const { data: progressData } = await supabase
    .from("user_progress")
    .select("problem_id, status")
    .eq("user_id", user.id)
    .in("problem_id", problemIds);

  const progressMap = new Map(
    progressData?.map((p) => [p.problem_id, p.status]) ?? []
  );

  const problems = setItems?.map((item) => {
    const problem = item.problems as unknown as {
      id: string;
      leetcode_id: number | null;
      title: string;
      difficulty: string | null;
      url: string | null;
      tags: string[] | null;
    };
    return {
      ...problem,
      status: progressMap.get(item.problem_id) ?? "new",
    };
  }) ?? [];

  // Calculate stats
  const stats = {
    total: problems.length,
    new: problems.filter((p) => p.status === "new").length,
    learning: problems.filter((p) => p.status === "learning").length,
    review: problems.filter((p) => p.status === "review").length,
    mastered: problems.filter((p) => p.status === "mastered").length,
  };

  return NextResponse.json({
    problemSet,
    problems,
    stats,
  });
}
