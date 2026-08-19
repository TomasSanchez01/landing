"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import type { HiddenPage } from "@/lib/hidden-pages";
import { deleteHiddenPageAction, setHiddenPageEnabledAction } from "../actions";

export function PageRow({ page }: { page: HiddenPage }) {
  const [isPending, startTransition] = useTransition();
  const [removed, setRemoved] = useState(false);

  if (removed) return null;

  const handleDelete = () => {
    if (!confirm(`¿Eliminar "${page.name}"? La URL /${page.slug} dejará de funcionar.`)) return;
    startTransition(async () => {
      await deleteHiddenPageAction(page.id);
      setRemoved(true);
    });
  };

  const handleToggleEnabled = () => {
    startTransition(() => setHiddenPageEnabledAction(page.id, !page.enabled));
  };

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{page.name || "(sin nombre)"}</p>
        <a
          href={`/${page.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground truncate hover:text-foreground inline-flex items-center gap-1"
        >
          /{page.slug}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <span
        className={`text-xs px-2 py-1 rounded-full shrink-0 ${
          page.enabled ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
        }`}
      >
        {page.enabled ? "Habilitada" : "Deshabilitada"}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          onClick={handleToggleEnabled}
          title={page.enabled ? "Deshabilitar" : "Habilitar"}
        >
          {page.enabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={`/admin/paginas/${page.id}`} title="Editar">
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
