"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import type { ManualContent, ManualSection } from "@/lib/manual";
import { updateManualContent } from "../actions";

function newId() {
  return crypto.randomUUID();
}

function emptySection(): ManualSection {
  return { id: newId(), title: "", body: "" };
}

export function ManualForm({ content }: { content: ManualContent }) {
  const [intro, setIntro] = useState(content.intro);
  const [sections, setSections] = useState<ManualSection[]>(content.sections);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const updateSection = (index: number, patch: Partial<ManualSection>) => {
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
    setSaved(false);

    startTransition(async () => {
      try {
        await updateManualContent({
          intro: intro.trim(),
          sections: sections.map((s) => ({ ...s, title: s.title.trim() })),
        });
        setSaved(true);
      } catch {
        setError("No se pudo guardar. Intentá de nuevo.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Introducción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="intro">Texto de bienvenida</Label>
          <Textarea
            id="intro"
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={3}
            placeholder="Ej: Bienvenido al manual de tu metegol Capocannoniere..."
          />
          <p className="text-xs text-muted-foreground">
            Se muestra arriba de todo, antes de las secciones. Podés dejarlo vacío si no querés
            introducción.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card key={section.id}>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Título de la sección (ej: 1. Armado y ubicación)"
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
                    placeholder="Escribí el paso a paso o la explicación. Dejá una línea en blanco para separar párrafos."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Imagen (opcional)</Label>
                  <ImageUploader
                    value={section.image ? [section.image] : []}
                    onChange={(urls) => updateSection(index, { image: urls[urls.length - 1] })}
                    pathPrefix={`manual/${section.id}`}
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
      {saved && (
        <p className="text-sm text-green-600 flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" />
          Guardado.
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
        <Button variant="outline" asChild>
          <a href="/manualdeusuario/info" target="_blank" rel="noopener noreferrer">
            Ver página
            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </a>
        </Button>
      </div>
    </form>
  );
}
