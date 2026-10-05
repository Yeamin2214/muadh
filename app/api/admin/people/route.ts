import { currentProfile, isAdmin, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/** Mentor applications (all statuses) and active mentors with their answered counts. Admins only. */
export async function GET() {
  if (!isAdmin(await currentProfile())) return json({ error: "admins_only" }, 403);
  const db = adminClient();
  const [apps, mentors, answered, users] = await Promise.all([
    db.from("mentor_applications").select("user_id, details, status, note, created_at, reviewed_at, profiles(name, gender, role)").order("created_at", { ascending: false }),
    db.from("profiles").select("id, name, gender, created_at").eq("role", "mentor").order("name"),
    db.from("tickets").select("claimed_by").eq("status", "answered").not("claimed_by", "is", null).limit(10000),
    db.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const email = new Map((users.data?.users ?? []).map((u) => [u.id, u.email ?? ""]));
  const count = new Map<string, number>();
  (answered.data ?? []).forEach((t) => count.set(t.claimed_by as string, (count.get(t.claimed_by as string) ?? 0) + 1));
  return json({
    applications: (apps.data ?? []).map((a) => ({ ...a, email: email.get(a.user_id) ?? "" })),
    mentors: (mentors.data ?? []).map((m) => ({ ...m, email: email.get(m.id) ?? "", answered: count.get(m.id) ?? 0 })),
  });
}
