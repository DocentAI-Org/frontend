import { redirect } from "next/navigation";

import { getMe } from "@/lib/api/me";
import { ROLE_HOME } from "@/lib/auth/home";

/** Sends each user to their role's home (001 US7 AS2); the proxy handles signed-out visitors. */
export default async function Home() {
  const me = await getMe();
  redirect(me.ok ? ROLE_HOME[me.data.role] : "/sign-in");
}
