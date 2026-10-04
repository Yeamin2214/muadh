import { currentProfile, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/** The learner's own questions, answers and mentor replies, newest first. */
export async function GET() {
  const me = await currentProfile();
  if (!me) return json({ error: "sign_in_required" }, 401);

  const { data, error } = await adminClient()
    .from("questions")
    .select("id, text, lang, action, answer, created_at, tickets(id, status, reply_learner, answered_at)")
    .eq("learner_id", me.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return json({ error: "load_failed" }, 500);
  return json({ messages: data });
}
