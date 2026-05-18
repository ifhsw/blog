import { auth } from "@/lib/auth";
import { NavBar } from "./NavBar";

export async function Header() {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const userName = session?.user?.name || null;

  return <NavBar isAdmin={isAdmin} userName={userName} />;
}
