import { currentProfile, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/** 👍 or 👎 on one of the learner's own answers. */
export async function POST(req: Request) {
  const me = await currentProfile();
  if (!me) return json({ error: "sign_in_required" }, 401);
  const b = await req.json().catch(() => ({}));
  const value = b.value === 1 || b.value === -1 ? b.value : null;
  if (!value || typeof b.questionId !== "string") return json({ error: "bad_request" }, 400);
  const { error } = await adminClient().from("questions").update({ feedback: value }).eq("id", b.questionId).eq("learner_id", me.id);
  return error ? json({ error: "save_failed" }, 500) : json({ ok: true });
}
