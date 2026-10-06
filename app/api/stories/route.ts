import { currentProfile, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/** Published stories for the landing page. */
export async function GET() {
  const { data } = await adminClient().from("stories").select("id, title, body, display_name, lang, created_at")
    .eq("status", "approved").order("created_at", { ascending: false }).limit(12);
  return Response.json({ stories: data ?? [] }, { headers: { "cache-control": "public, max-age=120" } });
}

/** A learner shares their story. It stays private until an admin publishes it. */
export async function POST(req: Request) {
  const me = await currentProfile();
  if (!me || me.role !== "learner") return json({ error: "learners_only" }, 403);
  const b = await req.json().catch(() => ({}));
  const title = typeof b.title === "string" ? b.title.trim().slice(0, 120) : "";
  const body = typeof b.body === "string" ? b.body.trim().slice(0, 5000) : "";
  if (title.length < 3 || body.length < 30) return json({ error: "too_short" }, 400);
  const { error } = await adminClient().from("stories").insert({ user_id: me.id, title, body, lang: me.language, display_name: b.showName ? me.name : null });
  return error ? json({ error: "save_failed" }, 500) : json({ ok: true });
}
