import { adminClient } from "@/lib/supabase/admin";

/** Public headline numbers from the latest full evaluation run, for the landing page. No test details. */
export async function GET() {
  const { data } = await adminClient().from("eval_runs").select("created_at, summary")
    .eq("summary->>partial", "false").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!data) return Response.json({ run: null });
  const s = data.summary;
  return Response.json(
    { run: { date: data.created_at, cases: s.cases, correct: s.correct, critical: s.critical, abstention: s.abstention, fabricated: s.fabricated, sources: s.sources } },
    { headers: { "cache-control": "public, max-age=300" } },
  );
}
