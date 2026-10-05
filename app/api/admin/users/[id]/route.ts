import { currentProfile, isAdmin, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/** One learner's chats with every question, answer outcome and mentor reply. Admins only. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdmin(await currentProfile())) return json({ error: "admins_only" }, 403);
  const { id } = await ctx.params;
  const { data } = await adminClient().from("conversations")
    .select("id, title, updated_at, questions(id, text, action, level, created_at, answer, tickets(status, reply_learner))")
    .eq("learner_id", id).order("updated_at", { ascending: false }).limit(50);
  return json({ chats: data ?? [] });
}
