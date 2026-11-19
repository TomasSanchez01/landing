"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { ADMIN_SECTIONS } from "./admin-nav";

export function AdminHeader({ email }: { email: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/admin";

  const handleLogout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="border-b border-border/50">
      <div className="container mx-auto flex h-14 items-center justify-between gap-3 px-4">
        <Link href="/admin" className="font-semibold">
          Capocannoniere <span className="font-normal text-muted-foreground">· Admin</span>
        </Link>
        <button
          onClick={handleLogout}
          title={email ? `Salir (${email})` : "Salir"}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </div>

      {/* En el inicio la grilla ya es la navegación; en las demás páginas mostramos las secciones. */}
      {!isHome && (
        <nav className="container mx-auto flex gap-1 overflow-x-auto px-4 pb-2">
          {ADMIN_SECTIONS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-sm transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
