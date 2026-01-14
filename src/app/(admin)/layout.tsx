import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/check-admin";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isUserAdmin = await isAdmin();

  // 🔒 Redirect non-admins to user dashboard
  if (!isUserAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="h-full bg-[#0b0f19]">
      <div className="fixed inset-y-0 w-full z-50 h-16"><Navbar /></div>
      <div className="hidden md:flex flex-col fixed inset-y-0 mt-16 z-50"><Sidebar /></div>
      <main className="md:pl-64 pt-16 h-full overflow-y-auto">{children}</main>
    </div>
  );
}