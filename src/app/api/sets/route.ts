import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all preset problem sets with problem counts
  const { data: sets, error: setsError } = await supabase
    .from("problem_sets")
    .select(`
      id,
      name,
      description,
      is_preset,
      problem_set_items(count)
    `)
    .eq("is_preset", true);

  if (setsError) {
    return NextResponse.json({ error: setsError.message }, { status: 500 });
  }

  // Get user's active sets
  const { data: userSets } = await supabase
    .from("user_problem_sets")
    .select("problem_set_id, is_active")
    .eq("user_id", user.id);

  const userSetMap = new Map(
    userSets?.map((s) => [s.problem_set_id, s.is_active]) ?? []
  );

  const setsWithStatus = sets?.map((set) => ({
    id: set.id,
    name: set.name,
    description: set.description,
    problemCount: set.problem_set_items?.[0]?.count ?? 0,
    isActive: userSetMap.get(set.id) ?? false,
  }));

  return NextResponse.json({ sets: setsWithStatus });
}
