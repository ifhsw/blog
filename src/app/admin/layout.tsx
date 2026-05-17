import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") redirect("/login");

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 flex gap-8">
      <AdminSidebar />
      <div className="flex-1">{children}</div>
    </main>
  );
}
