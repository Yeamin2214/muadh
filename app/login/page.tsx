import { redirect } from "next/navigation";
/** Old link: learners now sign in at /user/login. */
export default function OldLogin() {
  redirect("/user/login");
}
