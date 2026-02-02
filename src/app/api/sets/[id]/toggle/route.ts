import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user already has this set
  const { data: existing } = await supabase
    .from("user_problem_sets")
    .select("id, is_active")
    .eq("user_id", user.id)
    .eq("problem_set_id", id)
    .single();

  if (existing) {
    // Toggle the existing record
    const { error } = await supabase
      .from("user_problem_sets")
      .update({ is_active: !existing.is_active })
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ isActive: !existing.is_active });
  } else {
    // Create new record
    const { error } = await supabase
      .from("user_problem_sets")
      .insert({
        user_id: user.id,
        problem_set_id: id,
        is_active: true,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ isActive: true });
  }
}
