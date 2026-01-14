import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/check-admin";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient"; // Import the client wrapper

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isUserAdmin = await isAdmin();

  if (!isUserAdmin) {
    redirect("/dashboard");
  }

  // Pass children to the Client Wrapper which handles the Sidebar State
  return (
    <AdminLayoutClient>
        {children}
    </AdminLayoutClient>
  );
}