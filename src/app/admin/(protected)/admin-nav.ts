import { BookOpen, Boxes, Gamepad2, Package, QrCode, Settings, type LucideIcon } from "lucide-react";

export type AdminSection = { href: string; label: string; icon: LucideIcon };

// Única fuente de verdad de las secciones del admin: la usan la barra superior y el inicio.
export const ADMIN_SECTIONS: AdminSection[] = [
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/stock", label: "Stock", icon: Boxes },
  { href: "/admin/manual", label: "Manual", icon: BookOpen },
  { href: "/admin/paginas", label: "Páginas extra", icon: QrCode },
  { href: "/admin/capofinger", label: "CapoFinger", icon: Gamepad2 },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];
