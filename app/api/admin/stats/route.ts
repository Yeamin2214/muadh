import { currentProfile, isAdmin, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/** All dashboard statistics, computed in one database query. Admins only. */
export async function GET() {
  if (!isAdmin(await currentProfile())) return json({ error: "admins_only" }, 403);
  const { data, error } = await adminClient().rpc("admin_stats");
  return error ? json({ error: "load_failed" }, 500) : json(data);
}
