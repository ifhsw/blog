import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MyPostsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {children}
    </main>
  );
}
