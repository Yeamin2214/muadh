import { currentProfile, isAdmin, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!isAdmin(await currentProfile())) return json({ error: "admins_only" }, 403);
  const { data } = await adminClient().from("stories").select("id, title, body, display_name, status, created_at").order("created_at", { ascending: false }).limit(100);
  return json({ stories: data ?? [] });
}

export async function POST(req: Request) {
  if (!isAdmin(await currentProfile())) return json({ error: "admins_only" }, 403);
  const b = await req.json().catch(() => ({}));
  const status = b.action === "approve" ? "approved" : b.action === "reject" ? "rejected" : null;
  if (!status || typeof b.id !== "string") return json({ error: "bad_request" }, 400);
  await adminClient().from("stories").update({ status }).eq("id", b.id);
  return json({ ok: true });
}
