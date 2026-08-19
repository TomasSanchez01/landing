import Link from "next/link";
import { getAllHiddenPages } from "@/lib/hidden-pages";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PageRow } from "./page-row";

export default async function HiddenPagesAdminPage() {
  const pages = await getAllHiddenPages();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Páginas extra</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Páginas ocultas con URL fija, pensadas para apuntar un QR (garantía, instructivos,
            etc). No aparecen en ningún menú del sitio, solo son accesibles para quien tenga el
            link.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/paginas/nueva">
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva página
          </Link>
        </Button>
      </div>

      {pages.length === 0 ? (
        <p className="text-muted-foreground">Todavía no hay páginas extra creadas.</p>
      ) : (
        <div className="border border-border/50 rounded-lg divide-y divide-border/50">
          {pages.map((page) => (
            <PageRow key={page.id} page={page} />
          ))}
        </div>
      )}
    </div>
  );
}
