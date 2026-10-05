import { currentProfile, isAdmin, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";
import { mentorEmail, sendEmail } from "@/lib/email";

/** Approve or reject an application, or remove an active mentor's access. Admins only. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await currentProfile();
  if (!isAdmin(me)) return json({ error: "admins_only" }, 403);
  const { id } = await ctx.params;
  if (id === me.id) return json({ error: "not_yourself" }, 400);
  const body = await req.json().catch(() => ({}));
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) || null : null;
  const db = adminClient();
  const now = new Date().toISOString();
  const notify = async (kind: "approved" | "rejected") => {
    const [{ data: u }, { data: app }] = await Promise.all([
      db.auth.admin.getUserById(id),
      db.from("mentor_applications").select("details").eq("user_id", id).maybeSingle(),
    ]);
    const name = (app?.details as { full_name?: string } | null)?.full_name || "";
    const m = mentorEmail(kind, name, note);
    return sendEmail(u.user?.email ?? "", m.subject, m.text);
  };

  if (body?.action === "approve") {
    await db.from("profiles").update({ role: "mentor" }).eq("id", id).in("role", ["applicant", "mentor"]);
    await db.from("mentor_applications").update({ status: "approved", note: null, reviewed_at: now }).eq("user_id", id);
    return json({ ok: true, emailed: await notify("approved") });
  }
  if (body?.action === "reject") {
    await db.from("mentor_applications").update({ status: "rejected", note, reviewed_at: now }).eq("user_id", id);
    return json({ ok: true, emailed: await notify("rejected") });
  }
  if (body?.action === "revoke") {
    // The mentor keeps their account but loses portal access until approved again.
    await db.from("profiles").update({ role: "applicant" }).eq("id", id).eq("role", "mentor");
    const update = { status: "rejected", note: note ?? "Access removed by admin", reviewed_at: now };
    const { data: existing } = await db.from("mentor_applications").select("user_id").eq("user_id", id).maybeSingle();
    if (existing) await db.from("mentor_applications").update(update).eq("user_id", id);
    else await db.from("mentor_applications").insert({ user_id: id, details: {}, ...update });
    return json({ ok: true });
  }
  return json({ error: "unknown_action" }, 400);
}
