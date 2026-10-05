import { currentProfile, isAdmin, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

type Rating = { overall: number; ease: number | null; trust: number | null; useful: number | null; comment: string | null; role: string; demo: boolean; created_at: string; profiles: { name: string | null } | null };

const avg = (xs: (number | null)[]) => {
  const v = xs.filter((x): x is number => typeof x === "number");
  return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : null;
};

/** Tester ratings and answer feedback. Real accounts and demo accounts are reported separately. Admins only. */
export async function GET() {
  if (!isAdmin(await currentProfile())) return json({ error: "admins_only" }, 403);
  const db = adminClient();
  const [{ data: ratings }, up, down] = await Promise.all([
    db.from("app_ratings").select("overall, ease, trust, useful, comment, role, demo, created_at, profiles(name)").order("created_at", { ascending: false }).limit(1000),
    db.from("questions").select("id", { count: "exact", head: true }).eq("feedback", 1),
    db.from("questions").select("id", { count: "exact", head: true }).eq("feedback", -1),
  ]);
  const all = (ratings ?? []) as unknown as Rating[];
  const real = all.filter((r) => !r.demo);
  const summarize = (rs: Rating[]) => ({
    count: rs.length,
    overall: avg(rs.map((r) => r.overall)), ease: avg(rs.map((r) => r.ease)), trust: avg(rs.map((r) => r.trust)), useful: avg(rs.map((r) => r.useful)),
    distribution: [5, 4, 3, 2, 1].map((s) => ({ stars: s, count: rs.filter((r) => r.overall === s).length })),
    learners: rs.filter((r) => r.role === "learner").length, mentors: rs.filter((r) => r.role !== "learner").length,
  });
  return json({
    real: summarize(real),
    demo: summarize(all.filter((r) => r.demo)),
    answers: { helpful: up.count ?? 0, notHelpful: down.count ?? 0 },
    comments: all.filter((r) => r.comment).slice(0, 40).map((r) => ({ comment: r.comment, overall: r.overall, role: r.role, demo: r.demo, name: r.profiles?.name ?? null, at: r.created_at })),
  });
}
