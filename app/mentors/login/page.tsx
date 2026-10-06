import { redirect } from "next/navigation";
/** Old link: mentors now sign in at /mentor/login. */
export default function OldMentorLogin() {
  redirect("/mentor/login");
}
