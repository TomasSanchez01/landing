"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { clientAuth } from "@/lib/firebase-client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function AdminHeader({ email }: { email: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(clientAuth).catch(() => {});
    await fetch("/api/admin/session", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="border-b border-border/50 bg-secondary/20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="font-semibold">
          Panel de administración
        </Link>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{email}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1.5" />
            Salir
          </Button>
        </div>
      </div>
    </div>
  );
}
