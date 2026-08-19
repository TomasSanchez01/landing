"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GripVertical,
  Lock,
  Plus,
  Trash2,
} from "lucide-react";
import type { HiddenPage, HiddenPageInput, HiddenPageSection } from "@/lib/hidden-pages";
import { createHiddenPageAction, updateHiddenPageAction } from "../actions";

function newId() {
  return crypto.randomUUID();
}

function emptySection(): HiddenPageSection {
  return { id: newId(), title: "", body: "" };
}

export function PageForm({ page }: { page?: HiddenPage }) {
  const router = useRouter();
  const isEditing = !!page;

  const [slug, setSlug] = useState(page?.slug ?? "");
  const [name, setName] = useState(page?.name ?? "");
  const [title, setTitle] = useState(page?.title ?? "");
  const [enabled, setEnabled] = useState(page?.enabled ?? true);
  const [intro, setIntro] = useState(page?.intro ?? "");
  const [sections, setSections] = useState<HiddenPageSection[]>(page?.sections ?? []);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const updateSection = (index: number, patch: Partial<HiddenPageSection>) => {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const addSection = () => {
    setSections((prev) => [...prev, emptySection()]);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    setSections((prev) => {
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedSections = sections.map((s) => ({ ...s, title: s.title.trim() }));

    startTransition(async () => {
      try {
        if (isEditing) {
          const input: Omit<HiddenPageInput, "slug"> = {
            name: name.trim(),
            title: title.trim(),
            enabled,
            intro: intro.trim(),
            sections: trimmedSections,
          };
          await updateHiddenPageAction(page.id, input);
        } else {
          const input: HiddenPageInput = {
            slug: slug.trim(),
            name: name.trim(),
            title: title.trim(),
            enabled,
            intro: intro.trim(),
            sections: trimmedSections,
          };
          await createHiddenPageAction(input);
        }
      } catch (err) {
        const digest = (err as { digest?: string })?.digest;
        if (digest?.startsWith("NEXT_REDIRECT")) throw err;
        setError(err instanceof Error ? err.message : "No se pudo guardar. Intentá de nuevo.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos generales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre interno</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Garantía metegol"
              required
            />
            <p className="text-xs text-muted-foreground">
              Solo para identificarla en este listado, no se muestra en la página pública.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">URL</Label>
            {isEditing ? (
              <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-md px-3 py-2">
                <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <code className="truncate">capocannoniere.com.ar/{page.slug}</code>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground shrink-0">
                  capocannoniere.com.ar/
                </span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="garantia/producto"
                  required
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {isEditing
                ? "No se puede cambiar: si el QR ya está impreso, modificar la URL lo rompería."
                : "Definila con cuidado: una vez creada la página no se puede modificar. Es la URL a la que vas a apuntar el QR."}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Título (se muestra arriba de todo en la página)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Garantía Capocannoniere"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <input
              id="enabled"
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="enabled">Página habilitada</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Introducción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={3}
            placeholder="Texto que se muestra debajo del título, antes de las secciones (opcional)."
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card key={section.id}>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Título de la sección (ej: Condiciones de cobertura)"
                  value={section.title}
                  onChange={(e) => updateSection(index, { title: e.target.value })}
                />
                <div className="flex flex-col shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={index === 0}
                    onClick={() => moveSection(index, "up")}
                    title="Subir"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={index === sections.length - 1}
                    onClick={() => moveSection(index, "down")}
                    title="Bajar"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSection(index)}
                  title="Eliminar sección"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="pl-6 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`body-${section.id}`} className="text-xs text-muted-foreground">
                    Contenido
                  </Label>
                  <Textarea
                    id={`body-${section.id}`}
                    value={section.body}
                    onChange={(e) => updateSection(index, { body: e.target.value })}
                    rows={5}
                    placeholder="Escribí el texto. Dejá una línea en blanco para separar párrafos."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Imagen (opcional)</Label>
                  <ImageUploader
                    value={section.image ? [section.image] : []}
                    onChange={(urls) => updateSection(index, { image: urls[urls.length - 1] })}
                    pathPrefix={`paginas-extra/${section.id}`}
                    multiple={false}
                    label="Imagen"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button type="button" variant="outline" size="sm" onClick={addSection}>
          <Plus className="w-4 h-4 mr-1.5" />
          Agregar sección
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear página"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/paginas")}>
          Cancelar
        </Button>
        {isEditing && (
          <Button variant="outline" asChild>
            <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
              Ver página
              <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </a>
          </Button>
        )}
      </div>
    </form>
  );
}
