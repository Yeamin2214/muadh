import { currentProfile, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

const OK_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

/** Optional certificates for a mentor application: up to 3 files, 5 MB each, stored privately. */
export async function POST(req: Request) {
  const me = await currentProfile();
  if (!me || me.role !== "applicant") return json({ error: "applicants_only" }, 403);
  const form = await req.formData().catch(() => null);
  const files = (form?.getAll("files") ?? []).filter((f): f is File => f instanceof File && f.size > 0).slice(0, 3);
  if (files.some((f) => !OK_TYPES.includes(f.type) || f.size > 5_000_000)) return json({ error: "bad_file" }, 400);
  const db = adminClient();
  const paths: string[] = [];
  for (const [i, f] of files.entries()) {
    const path = `${me.id}/${Date.now()}-${i}-${f.name.replace(/[^\w.-]/g, "_").slice(-60)}`;
    const { error } = await db.storage.from("mentor-docs").upload(path, f, { contentType: f.type });
    if (!error) paths.push(path);
  }
  const { data: app } = await db.from("mentor_applications").select("details").eq("user_id", me.id).maybeSingle();
  if (app) await db.from("mentor_applications").update({ details: { ...(app.details as object), docs: paths } }).eq("user_id", me.id);
  return json({ ok: true, uploaded: paths.length });
}
