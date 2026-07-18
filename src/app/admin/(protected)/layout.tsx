import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import { AdminHeader } from "./admin-header";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <AdminHeader email={session.email ?? ""} />
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
