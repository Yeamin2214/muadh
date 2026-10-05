import { currentProfile, json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

const text = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Saves a mentor application. Only accounts created through the mentor form (role "applicant") can apply. */
export async function POST(req: Request) {
  const me = await currentProfile();
  if (!me) return json({ error: "sign_in_required" }, 401);
  if (me.role !== "applicant") return json({ error: "not_an_applicant" }, 403);

  const b = await req.json().catch(() => ({}));
  const details = {
    full_name: text(b.full_name, 120),
    phone: text(b.phone, 40),
    location: text(b.location, 120),
    organisation: text(b.organisation, 160),
    position: text(b.position, 120),
    languages: Array.isArray(b.languages) ? b.languages.filter((l: unknown) => typeof l === "string").slice(0, 6) : [],
    qualifications: text(b.qualifications, 1500),
    experience_years: Math.max(0, Math.min(60, Number(b.experience_years) || 0)),
    agreed_guidelines: b.agreed === true,
  };
  if (!details.full_name || !details.phone || !details.organisation || !details.qualifications || !details.agreed_guidelines) {
    return json({ error: "missing_fields" }, 400);
  }
  const { error } = await adminClient().from("mentor_applications")
    .upsert({ user_id: me.id, details, status: "pending", note: null, reviewed_at: null });
  return error ? json({ error: "save_failed" }, 500) : json({ ok: true });
}
