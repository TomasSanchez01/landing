"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import type { Product } from "@/lib/product-types";
import { deleteProduct, setPublished } from "./actions";

export function ProductRow({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition();
  const [removed, setRemoved] = useState(false);

  if (removed) return null;

  const handleDelete = () => {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      await deleteProduct(product.id);
      setRemoved(true);
    });
  };

  const handleTogglePublished = () => {
    startTransition(() => setPublished(product.id, !product.published));
  };

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="relative w-14 h-14 rounded-md overflow-hidden bg-secondary/20 shrink-0">
        {product.tabImage && (
          <Image src={product.tabImage} alt={product.name} fill className="object-contain p-1" sizes="56px" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{product.name || "(sin nombre)"}</p>
        <p className="text-sm text-muted-foreground truncate">
          /producto/{product.slug} · {product.steps.length} característica(s)
        </p>
      </div>

      <span
        className={`text-xs px-2 py-1 rounded-full shrink-0 ${
          product.published
            ? "bg-green-500/10 text-green-600"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {product.published ? "Publicado" : "Borrador"}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={handleTogglePublished}
          title={product.published ? "Despublicar" : "Publicar"}
        >
          {product.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={`/admin/productos/${product.id}`} title="Editar">
            <Pencil className="w-4 h-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={handleDelete}
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
