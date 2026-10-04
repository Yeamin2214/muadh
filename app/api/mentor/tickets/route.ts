import { currentProfile, isMentor, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/**
 * The shared inbox. A mentor only ever sees tickets of their own gender.
 * view=open (default): new and claimed tickets; view=mine: claimed by me; view=answered.
 */
export async function GET(req: Request) {
  const me = await currentProfile();
  if (!isMentor(me)) return json({ error: "mentors_only" }, 403);

  const view = new URL(req.url).searchParams.get("view") ?? "open";
  let query = adminClient()
    .from("tickets")
    .select("id, reason, urgent, original, original_lang, question_ar, draft_ar, preferred_mentor, status, claimed_by, reply_ar, reply_learner, created_at, answered_at, profiles!tickets_learner_id_fkey(name, language, phone, phone_consent)")
    .eq("gender", me.gender)
    .order("urgent", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(100);

  if (view === "mine") query = query.eq("claimed_by", me.id).neq("status", "answered");
  else if (view === "answered") query = query.eq("status", "answered");
  else query = query.neq("status", "answered");

  const { data, error } = await query;
  if (error) return json({ error: "load_failed" }, 500);

  // Phone numbers are shown only when the learner agreed to be contacted.
  const tickets = (data ?? []).map((t) => {
    const learner = t.profiles as unknown as { name: string | null; language: string; phone: string | null; phone_consent: boolean } | null;
    return {
      ...t,
      profiles: undefined,
      learner: learner && { name: learner.name, language: learner.language, phone: learner.phone_consent ? learner.phone : null },
      mine: t.claimed_by === me.id,
      preferred: t.preferred_mentor === me.id,
    };
  });
  return json({ tickets });
}
