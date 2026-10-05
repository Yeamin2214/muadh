import { currentProfile, isAdmin, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/** The latest evaluation run, in full. Admins only. */
export async function GET() {
  if (!isAdmin(await currentProfile())) return json({ error: "admins_only" }, 403);
  const { data } = await adminClient().from("eval_runs").select("created_at, summary, rows").order("created_at", { ascending: false }).limit(1).maybeSingle();
  return json({ run: data ?? null });
}
