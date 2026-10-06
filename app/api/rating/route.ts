import { currentProfile, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

const score = (v: unknown) => (Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 5 ? (v as number) : null);

/** Has this account rated Mu'adh yet? */
export async function GET() {
  const me = await currentProfile();
  if (!me) return json({ error: "sign_in_required" }, 401);
  const { data } = await adminClient().from("app_ratings").select("overall").eq("user_id", me.id).limit(1).maybeSingle();
  return json({ rated: !!data });
}

/**
 * Saves a rating. A real account keeps only its latest rating, so each person counts once.
 * Shared demo accounts may rate many times; those ratings are marked and shown separately.
 */
export async function POST(req: Request) {
  const me = await currentProfile();
  if (!me) return json({ error: "sign_in_required" }, 401);
  const b = await req.json().catch(() => ({}));
  const overall = score(b.overall);
  if (!overall) return json({ error: "overall_required" }, 400);

  const db = adminClient();
  const { data: user } = await db.auth.admin.getUserById(me.id);
  const demo = /\.demo@muadh\.app$/i.test(user.user?.email ?? "");
  if (!demo) {
    const { data: already } = await db.from("app_ratings").select("id").eq("user_id", me.id).limit(1).maybeSingle();
    if (already) return json({ error: "already_rated" }, 409);
  }
  const { error } = await db.from("app_ratings").insert({
    user_id: me.id, role: me.role, demo, overall, ease: score(b.ease), trust: score(b.trust), useful: score(b.useful),
    comment: typeof b.comment === "string" ? b.comment.trim().slice(0, 1000) || null : null,
  });
  return error ? json({ error: "save_failed" }, 500) : json({ ok: true });
}
