"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Signed-in mentors who open the sign-in link go straight to their page. Signed-out visitors see the sign-in form from the app frame. */
export default function MentorLoginRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/mentor"); }, [router]);
  return null;
}
