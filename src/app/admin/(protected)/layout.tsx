import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import { AdminHeader } from "./admin-header";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await getAdminSession();

  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <AdminHeader email={process.env.ADMIN_EMAIL ?? ""} />
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
