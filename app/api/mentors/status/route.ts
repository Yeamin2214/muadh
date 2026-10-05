import { currentProfile, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/** The signed-in account's role and, for mentor applicants, the review status. */
export async function GET() {
  const me = await currentProfile();
  if (!me) return json({ error: "sign_in_required" }, 401);
  const { data } = await adminClient().from("mentor_applications").select("status, note, created_at").eq("user_id", me.id).maybeSingle();
  return json({ role: me.role, name: me.name, application: data ?? null });
}
