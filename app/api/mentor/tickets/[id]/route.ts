import { currentProfile, isMentor, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";
import { translate } from "@/lib/translate";

type Action = "claim" | "release" | "backtranslate" | "reply";

/** Mentor actions on one ticket: claim it, release it, preview a back-translation, or send the reply. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await currentProfile();
  if (!isMentor(me)) return json({ error: "mentors_only" }, 403);

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const action = body?.action as Action;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const db = adminClient();

  const { data: ticket } = await db.from("tickets").select("*").eq("id", id).eq("gender", me.gender).single();
  if (!ticket) return json({ error: "not_found" }, 404);

  if (action === "claim") {
    if (ticket.status !== "new") return json({ error: "already_claimed" }, 409);
    const { data, error } = await db.from("tickets").update({ status: "claimed", claimed_by: me.id })
      .eq("id", id).eq("status", "new").select("id").maybeSingle();
    return error || !data ? json({ error: "already_claimed" }, 409) : json({ ok: true });
  }

  if (action === "release") {
    if (ticket.claimed_by !== me.id || ticket.status !== "claimed") return json({ error: "not_yours" }, 409);
    await db.from("tickets").update({ status: "new", claimed_by: null }).eq("id", id);
    return json({ ok: true });
  }

  if (action === "backtranslate") {
    if (!text) return json({ error: "empty" }, 400);
    return json({ text: await translate(text, "en") });
  }

  if (action === "reply") {
    if (!text) return json({ error: "empty" }, 400);
    if (ticket.status === "answered") return json({ error: "already_answered" }, 409);
    if (ticket.claimed_by && ticket.claimed_by !== me.id) return json({ error: "claimed_by_other" }, 409);
    const learnerText = ticket.original_lang === "ar" ? text : await translate(text, ticket.original_lang);
    await db.from("tickets").update({
      status: "answered", claimed_by: me.id, reply_ar: text, reply_learner: learnerText, answered_at: new Date().toISOString(),
    }).eq("id", id);
    return json({ ok: true, reply_learner: learnerText });
  }

  return json({ error: "unknown_action" }, 400);
}
