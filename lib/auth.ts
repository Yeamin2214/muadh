import { userClient } from "./supabase/server";
import { adminClient } from "./supabase/admin";

export type Profile = {
  id: string;
  role: "learner" | "mentor" | "admin";
  name: string | null;
  gender: "male" | "female" | null;
  language: "en" | "ar" | "bn";
};

/** Returns the signed-in user's profile, or null when not signed in. */
export async function currentProfile(): Promise<Profile | null> {
  const supabase = await userClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await adminClient()
    .from("profiles")
    .select("id, role, name, gender, language")
    .eq("id", data.user.id)
    .single();
  return (profile as Profile) ?? null;
}

export function isMentor(p: Profile | null): p is Profile & { gender: "male" | "female" } {
  return !!p && (p.role === "mentor" || p.role === "admin") && !!p.gender;
}

export const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "cache-control": "no-store" } });
