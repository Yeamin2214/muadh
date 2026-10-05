import { json } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

const text = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Creates a mentor applicant account and its application in one step, with no email code:
 * the admin review is the verification. The account has no access until an admin approves it.
 */
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const email = text(b.email, 200).toLowerCase(), password = typeof b.password === "string" ? b.password : "";
  const gender = b.gender === "male" || b.gender === "female" ? b.gender : null;
  const details = {
    full_name: text(b.full_name, 120), phone: text(b.phone, 40), location: text(b.location, 120),
    organisation: text(b.organisation, 160), position: text(b.position, 120),
    languages: Array.isArray(b.languages) ? b.languages.filter((l: unknown) => typeof l === "string").slice(0, 6) : [],
    qualifications: text(b.qualifications, 1500), experience_years: Math.max(0, Math.min(60, Number(b.experience_years) || 0)),
    agreed_guidelines: b.agreed === true,
  };
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || !gender || !details.full_name || !details.phone || !details.organisation || !details.qualifications || !details.agreed_guidelines) {
    return json({ error: "missing_fields" }, 400);
  }
  const db = adminClient();
  const { data, error } = await db.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { name: details.full_name.split(" ")[0], gender, language: typeof b.language === "string" ? b.language : "ar", account: "mentor" },
  });
  if (error || !data.user) return json({ error: /registered|exists/i.test(error?.message ?? "") ? "taken" : "failed" }, error ? 409 : 500);
  await db.from("mentor_applications").insert({ user_id: data.user.id, details, status: "pending" });
  return json({ ok: true });
}
