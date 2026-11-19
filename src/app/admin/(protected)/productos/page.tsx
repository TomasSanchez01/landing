import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProductRow } from "./product-row";

export default async function AdminDashboardPage() {
  const products = await getAllProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button asChild>
          <Link href="/admin/productos/nuevo">
            <Plus className="w-4 h-4 mr-1.5" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <p className="text-muted-foreground">Todavía no hay productos cargados.</p>
      ) : (
        <div className="border border-border/50 rounded-lg divide-y divide-border/50">
          {products.map((product, index) => (
            <ProductRow
              key={product.id}
              product={product}
              isFirst={index === 0}
              isLast={index === products.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
