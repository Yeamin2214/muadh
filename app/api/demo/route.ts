import { userClient } from "@/lib/supabase/server";
import { json } from "@/lib/auth";

/** One-click demo login for judges. Demo passwords stay on the server and are never sent to the browser. */
const DEMO: Record<string, string> = {
  learner: "learner.demo@muadh.app",
  mentor: "mentor.demo@muadh.app",
  mentor_f: "sister-mentor.demo@muadh.app",
};

export async function POST(req: Request) {
  const { role } = await req.json().catch(() => ({}));
  const email = DEMO[role as string];
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password) return json({ error: "demo_unavailable" }, 400);
  const supabase = await userClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return json({ error: "demo_unavailable" }, 503);
  return json({ ok: true, to: role === "learner" ? "/" : "/mentor" });
}
