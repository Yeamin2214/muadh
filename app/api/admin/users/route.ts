import { currentProfile, isAdmin, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/** All learners with their progress and activity. Admins only. */
export async function GET() {
  if (!isAdmin(await currentProfile())) return json({ error: "admins_only" }, 403);
  const db = adminClient();
  const [{ data: learners }, { data: qs }, users] = await Promise.all([
    db.from("profiles").select("id, name, gender, language, lessons_done, created_at").eq("role", "learner").order("created_at", { ascending: false }).limit(1000),
    db.from("questions").select("learner_id").limit(20000),
    db.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const email = new Map((users.data?.users ?? []).map((u) => [u.id, u.email ?? ""]));
  const count = new Map<string, number>();
  (qs ?? []).forEach((q) => count.set(q.learner_id, (count.get(q.learner_id) ?? 0) + 1));
  return json({
    users: (learners ?? []).map((l) => ({ ...l, lessons: l.lessons_done?.length ?? 0, lessons_done: undefined, email: email.get(l.id) ?? "", questions: count.get(l.id) ?? 0 })),
  });
}
