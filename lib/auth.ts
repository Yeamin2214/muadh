import { userClient } from "./supabase/server";
import { adminClient } from "./supabase/admin";

export type Profile = {
  id: string;
  role: "learner" | "applicant" | "mentor" | "admin";
  name: string | null;
  gender: "male" | "female" | null;
  language: "en" | "ar" | "bn";
};

/** Returns the signed-in user's profile, or null when not signed in. */
export async function currentProfile(): Promise<Profile | null> {
  // getClaims verifies the login token locally when possible, avoiding a network round trip.
  const supabase = await userClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;
  const { data: profile } = await adminClient()
    .from("profiles")
    .select("id, role, name, gender, language")
    .eq("id", userId)
    .single();
  return (profile as Profile) ?? null;
}

export function isMentor(p: Profile | null): p is Profile & { gender: "male" | "female" } {
  return !!p && (p.role === "mentor" || p.role === "admin") && !!p.gender;
}

export const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "cache-control": "no-store" } });

export function isAdmin(p: Profile | null): p is Profile {
  return !!p && p.role === "admin";
}
