import { currentProfile, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/** Messages in one of the learner's chats, oldest first, with mentor status and replies. Marks the chat as read. */
export async function GET(req: Request) {
  const me = await currentProfile();
  if (!me) return json({ error: "sign_in_required" }, 401);
  const id = new URL(req.url).searchParams.get("c");
  if (!id) return json({ messages: [] });

  const db = adminClient();
  const { data: chat } = await db.from("conversations").select("id").eq("id", id).eq("learner_id", me.id).maybeSingle();
  if (!chat) return json({ error: "not_found" }, 404);

  const { data, error } = await db
    .from("questions")
    .select("id, text, lang, action, answer, feedback, created_at, tickets(id, status, reply_learner, answered_at, mentor:profiles!tickets_claimed_by_fkey(name))")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) return json({ error: "load_failed" }, 500);
  await db.from("conversations").update({ last_read_at: new Date().toISOString() }).eq("id", id);
  return json({ messages: data });
}
