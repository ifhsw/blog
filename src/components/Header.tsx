import { auth } from "@/lib/auth";
import { NavBar } from "./NavBar";

export async function Header() {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const isLoggedIn = !!session?.user;
  const userName = session?.user?.name || null;
  const userAvatar = (session?.user as any)?.avatar || null;

  return <NavBar isAdmin={isAdmin} isLoggedIn={isLoggedIn} userName={userName} userAvatar={userAvatar} />;
}
