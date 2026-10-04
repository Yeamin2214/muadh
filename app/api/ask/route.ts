import { ask, type Lang } from "@/lib/engine";
import { currentProfile, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

const LANGS: Lang[] = ["en", "ar", "bn"];
const PER_MINUTE = 6;

export const maxDuration = 60;

export async function POST(req: Request) {
  const me = await currentProfile();
  if (!me) return json({ error: "sign_in_required" }, 401);
  if (!me.gender) return json({ error: "profile_incomplete" }, 400);

  const body = await req.json().catch(() => null);
  const text = typeof body?.question === "string" ? body.question.trim() : "";
  const lang: Lang = LANGS.includes(body?.lang) ? body.lang : me.language;
  if (text.length < 2 || text.length > 1000) return json({ error: "invalid_question" }, 400);
  const lesson = Number.isInteger(body?.lesson) && body.lesson >= 1 && body.lesson <= 40 ? (body.lesson as number) : undefined;

  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await adminClient()
    .from("questions").select("id", { count: "exact", head: true })
    .eq("learner_id", me.id).gte("created_at", since);
  if ((count ?? 0) >= PER_MINUTE) return json({ error: "slow_down" }, 429);

  try {
    return json(await ask(text, lang, { id: me.id, gender: me.gender }, lesson));
  } catch (err) {
    console.error("ask failed", err);
    return json({ error: "temporarily_unavailable" }, 503);
  }
}
