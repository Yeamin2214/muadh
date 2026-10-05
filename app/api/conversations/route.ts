import { currentProfile, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/** The learner's chats, newest first, with counts of new mentor replies and questions still waiting. */
export async function GET() {
  const me = await currentProfile();
  if (!me) return json({ error: "sign_in_required" }, 401);
  const db = adminClient();
  const { data: chats } = await db.from("conversations").select("id, title, last_read_at, updated_at")
    .eq("learner_id", me.id).order("updated_at", { ascending: false }).limit(50);
  const { data: tickets } = await db.from("tickets").select("status, answered_at, questions!inner(conversation_id)")
    .eq("learner_id", me.id);
  const conversations = (chats ?? []).map((c) => {
    const mine = (tickets ?? []).filter((t) => (t.questions as unknown as { conversation_id: string }).conversation_id === c.id);
    return {
      id: c.id, title: c.title, updated_at: c.updated_at,
      unread: mine.filter((t) => t.status === "answered" && t.answered_at && t.answered_at > c.last_read_at).length,
      waiting: mine.filter((t) => t.status !== "answered").length,
    };
  });
  return json({ conversations });
}

/** Deletes one of the learner's own chats and everything in it. */
export async function DELETE(req: Request) {
  const me = await currentProfile();
  if (!me) return json({ error: "sign_in_required" }, 401);
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return json({ error: "bad_request" }, 400);
  await adminClient().from("conversations").delete().eq("id", id).eq("learner_id", me.id);
  return json({ ok: true });
}
