import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Problem {
  leetcode_id: number;
  title: string;
  difficulty: string;
  url: string;
  tags: string[];
  category?: string;
}

async function seedProblems() {
  console.log("Starting seed...");

  // Read problem data
  const neetcode150: Problem[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../supabase/seed/neetcode-150.json"), "utf-8")
  );
  const leetcode75: Problem[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../supabase/seed/leetcode-75.json"), "utf-8")
  );

  // Combine and deduplicate by leetcode_id
  const allProblems = new Map<number, Problem>();
  [...neetcode150, ...leetcode75].forEach((p) => {
    if (!allProblems.has(p.leetcode_id)) {
      allProblems.set(p.leetcode_id, p);
    }
  });

  console.log(`Found ${allProblems.size} unique problems`);

  // Insert problems
  const problemsToInsert = Array.from(allProblems.values()).map((p) => ({
    leetcode_id: p.leetcode_id,
    title: p.title,
    difficulty: p.difficulty,
    url: p.url,
    tags: p.tags,
  }));

  const { data: insertedProblems, error: problemError } = await supabase
    .from("problems")
    .upsert(problemsToInsert, { onConflict: "leetcode_id" })
    .select();

  if (problemError) {
    console.error("Error inserting problems:", problemError);
    return;
  }

  console.log(`Inserted ${insertedProblems?.length || 0} problems`);

  // Get all problems with their IDs
  const { data: allDbProblems } = await supabase.from("problems").select("id, leetcode_id");
  const problemIdMap = new Map(allDbProblems?.map((p) => [p.leetcode_id, p.id]) || []);

  // Create preset sets
  const neetcodeSetId = "00000000-0000-0000-0000-000000000001";
  const leetcode75SetId = "00000000-0000-0000-0000-000000000002";

  await supabase.from("problem_sets").upsert([
    {
      id: neetcodeSetId,
      name: "NeetCode 150",
      description: "Curated list of 150 essential LeetCode problems for coding interviews",
      is_preset: true,
    },
    {
      id: leetcode75SetId,
      name: "LeetCode 75",
      description: "Updated Blind 75 list - 75 essential problems for interview prep",
      is_preset: true,
    },
  ]);

  // Add problems to NeetCode 150 set
  const neetcodeItems = neetcode150.map((p, index) => ({
    problem_set_id: neetcodeSetId,
    problem_id: problemIdMap.get(p.leetcode_id),
    sort_order: index,
  })).filter((item) => item.problem_id);

  await supabase.from("problem_set_items").upsert(neetcodeItems, {
    onConflict: "problem_set_id,problem_id",
  });

  console.log(`Added ${neetcodeItems.length} problems to NeetCode 150`);

  // Add problems to LeetCode 75 set
  const leetcode75Items = leetcode75.map((p, index) => ({
    problem_set_id: leetcode75SetId,
    problem_id: problemIdMap.get(p.leetcode_id),
    sort_order: index,
  })).filter((item) => item.problem_id);

  await supabase.from("problem_set_items").upsert(leetcode75Items, {
    onConflict: "problem_set_id,problem_id",
  });

  console.log(`Added ${leetcode75Items.length} problems to LeetCode 75`);

  console.log("Seed complete!");
}

seedProblems().catch(console.error);
