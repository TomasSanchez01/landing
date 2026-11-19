import { ExternalLink } from "lucide-react";

export default function StockAdminPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Control de stock</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Piezas, ventas, estado de pedidos y lista de compras de cada producto.
          </p>
        </div>
        <a
          href="/admin/stock-app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm underline text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir en pantalla completa
        </a>
      </div>

      <iframe
        src="/admin/stock-app"
        title="Control de stock"
        className="w-full rounded-lg border border-border/50 bg-[#0b0b0c]"
        style={{ height: "calc(100vh - 14rem)", minHeight: 640 }}
      />
    </div>
  );
}
