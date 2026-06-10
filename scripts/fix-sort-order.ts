import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Reassigns clean sequential sort_order values, preserving existing relative
// order. Achievements with sort_order = 0 (newly seeded) are pushed to the end
// of their block instead of the front. Runs per session, ordering by
// (block_number, existing sort_order, id) with zeros treated as "last".
async function main() {
  const { data: achs } = await supabase
    .from("achievements")
    .select("id, session_number, block_number, sort_order, title");

  if (!achs || achs.length === 0) {
    console.log("No achievements found.");
    return;
  }

  // Group by session
  const bySession = new Map<number, typeof achs>();
  for (const a of achs) {
    if (!bySession.has(a.session_number)) bySession.set(a.session_number, []);
    bySession.get(a.session_number)!.push(a);
  }

  const updates: { id: string; sort_order: number }[] = [];

  for (const [, list] of bySession) {
    list.sort((a, b) => {
      if (a.block_number !== b.block_number) return a.block_number - b.block_number;
      // Push sort_order 0 (new items) to the end of their block
      const aOrder = a.sort_order && a.sort_order > 0 ? a.sort_order : Infinity;
      const bOrder = b.sort_order && b.sort_order > 0 ? b.sort_order : Infinity;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.id < b.id ? -1 : 1;
    });
    list.forEach((a, i) => updates.push({ id: a.id, sort_order: i + 1 }));
  }

  const results = await Promise.all(
    updates.map((u) => supabase.from("achievements").update({ sort_order: u.sort_order }).eq("id", u.id))
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) {
    console.error("Failed:", failed.error.message);
    process.exit(1);
  }

  console.log(`Reassigned sort_order for ${updates.length} achievement(s).`);
}

main();
