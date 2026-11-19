import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import { getAllHiddenPages } from "@/lib/hidden-pages";
import { getCapofingerSettings } from "@/lib/capofinger";
import { getSiteSettings } from "@/lib/settings";
import { getStockSummary } from "@/lib/stock";
import { ADMIN_SECTIONS } from "./admin-nav";

export const dynamic = "force-dynamic";

/** Si una consulta falla, el inicio igual se muestra (sin ese dato). */
async function safe<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch {
    return null;
  }
}

export default async function AdminHomePage() {
  const [products, pages, capofinger, settings, stock] = await Promise.all([
    safe(getAllProducts()),
    safe(getAllHiddenPages()),
    safe(getCapofingerSettings()),
    safe(getSiteSettings()),
    safe(getStockSummary()),
  ]);

  const enFabricacion = stock ? Object.values(stock).reduce((a, b) => a + b, 0) : null;

  // Un dato corto por tarjeta.
  const stats: Record<string, string | null> = {
    "/admin/productos": products ? `${products.length} cargados` : null,
    "/admin/stock": enFabricacion === null ? null : `${enFabricacion} en fabricación`,
    "/admin/configuracion": null,
    "/admin/manual": settings ? (settings.manualUsuarioEnabled ? "Visible" : "Oculto") : null,
    "/admin/paginas": pages ? `${pages.length} creadas` : null,
    "/admin/capofinger": capofinger ? `${capofinger.questions.length} preguntas` : null,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ADMIN_SECTIONS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-border/50 bg-card p-4 text-center transition-colors hover:border-primary hover:bg-secondary/50 sm:aspect-[4/3]"
          >
            <Icon className="h-8 w-8 text-primary" strokeWidth={1.75} />
            <div>
              <div className="font-semibold">{label}</div>
              {stats[href] && <div className="mt-0.5 text-xs text-muted-foreground">{stats[href]}</div>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
