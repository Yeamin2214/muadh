import { redirect } from "next/navigation";
export default function UserRoot() {
  redirect("/user/login");
}
