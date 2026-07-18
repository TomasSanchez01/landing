"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Plus, Trash2, GripVertical, AlertCircle } from "lucide-react";
import type { Product, ConfigStep, ConfigOption } from "@/lib/product-types";
import { createProduct, updateProduct, type ProductInput } from "./actions";

function newId() {
  return crypto.randomUUID();
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function emptyOption(): ConfigOption {
  return { id: newId(), label: "", images: [], priceModifier: 0 };
}

function emptyStep(order: number): ConfigStep {
  return { id: newId(), name: "", order, options: [emptyOption()] };
}

function emptyProduct(): ProductInput {
  return {
    slug: "",
    name: "",
    tabImage: "",
    description: "",
    longDescription: "",
    features: [],
    images: [],
    videos: [],
    basePrice: 0,
    discountPercent: 0,
    published: false,
    order: 0,
    steps: [],
  };
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEditing = Boolean(product);
  const [form, setForm] = useState<ProductInput>(product ?? emptyProduct());
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const update = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleNameChange = (name: string) => {
    update("name", name);
    if (!slugTouched) update("slug", slugify(name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.slug.trim()) {
      setError("Nombre y slug son obligatorios.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditing && product) {
          await updateProduct(product.id, form);
        } else {
          await createProduct(form);
        }
      } catch (err) {
        const digest = (err as { digest?: string })?.digest;
        if (digest?.startsWith("NEXT_REDIRECT")) throw err;
        setError("No se pudo guardar. Intentá de nuevo.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update("slug", slugify(e.target.value));
                }}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción corta</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longDescription">Descripción completa</Label>
            <Textarea
              id="longDescription"
              value={form.longDescription}
              onChange={(e) => update("longDescription", e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">Precio base</Label>
              <Input
                id="basePrice"
                type="number"
                min={0}
                step="0.01"
                value={form.basePrice}
                onChange={(e) => update("basePrice", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountPercent">Descuento (%)</Label>
              <Input
                id="discountPercent"
                type="number"
                min={0}
                max={100}
                value={form.discountPercent}
                onChange={(e) => update("discountPercent", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                type="number"
                value={form.order}
                onChange={(e) => update("order", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="published"
              type="checkbox"
              checked={form.published}
              onChange={(e) => update("published", e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="published">Publicado (visible en el sitio)</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imagen de solapa</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader
            value={form.tabImage ? [form.tabImage] : []}
            onChange={(urls) => update("tabImage", urls[urls.length - 1] ?? "")}
            pathPrefix={`products/${form.slug || "nuevo"}/tab`}
            multiple={false}
            label="Solapa"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Galería e imágenes generales</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader
            value={form.images}
            onChange={(urls) => update("images", urls)}
            pathPrefix={`products/${form.slug || "nuevo"}/gallery`}
            label="Imagen"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader
            value={form.videos}
            onChange={(urls) => update("videos", urls)}
            pathPrefix={`products/${form.slug || "nuevo"}/videos`}
            accept="video/mp4,video/webm,video/quicktime,video/*"
            kind="video"
            label="Video"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funciones / características destacadas</CardTitle>
        </CardHeader>
        <CardContent>
          <FeatureListEditor
            features={form.features}
            onChange={(features) => update("features", features)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurador (pasos que elige el cliente)</CardTitle>
        </CardHeader>
        <CardContent>
          <StepsEditor
            steps={form.steps}
            slug={form.slug}
            onChange={(steps) => update("steps", steps)}
          />
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function FeatureListEditor({
  features,
  onChange,
}: {
  features: string[];
  onChange: (features: string[]) => void;
}) {
  const update = (index: number, value: string) => {
    const next = [...features];
    next[index] = value;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {features.map((feature, index) => (
        <div key={index} className="flex gap-2">
          <Input value={feature} onChange={(e) => update(index, e.target.value)} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(features.filter((_, i) => i !== index))}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...features, ""])}
      >
        <Plus className="w-4 h-4 mr-1.5" />
        Agregar función
      </Button>
    </div>
  );
}

function StepsEditor({
  steps,
  slug,
  onChange,
}: {
  steps: ConfigStep[];
  slug: string;
  onChange: (steps: ConfigStep[]) => void;
}) {
  const updateStep = (index: number, patch: Partial<ConfigStep>) => {
    const next = [...steps];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeStep = (index: number) => {
    onChange(
      steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i }))
    );
  };

  const addStep = () => {
    onChange([...steps, emptyStep(steps.length)]);
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.id} className="border border-border/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="Nombre de la característica (ej: Césped)"
              value={step.name}
              onChange={(e) => updateStep(index, { name: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeStep(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <OptionsEditor
            options={step.options}
            slug={slug}
            stepId={step.id}
            onChange={(options) => updateStep(index, { options })}
          />
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addStep}>
        <Plus className="w-4 h-4 mr-1.5" />
        Agregar característica
      </Button>
    </div>
  );
}

function OptionsEditor({
  options,
  slug,
  stepId,
  onChange,
}: {
  options: ConfigOption[];
  slug: string;
  stepId: string;
  onChange: (options: ConfigOption[]) => void;
}) {
  const updateOption = (index: number, patch: Partial<ConfigOption>) => {
    const next = [...options];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="pl-6 space-y-3">
      {options.map((option, index) => (
        <div key={option.id} className="bg-secondary/20 rounded-md p-3 space-y-2">
          <div className="flex gap-2 items-start">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Nombre de la opción (ej: Césped verde estándar)"
                value={option.label}
                onChange={(e) => updateOption(index, { label: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <Label htmlFor={`price-${option.id}`} className="text-xs shrink-0">
                  Precio adicional
                </Label>
                <Input
                  id={`price-${option.id}`}
                  type="number"
                  step="0.01"
                  value={option.priceModifier}
                  onChange={(e) =>
                    updateOption(index, { priceModifier: Number(e.target.value) })
                  }
                  className="w-32"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeOption(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <ImageUploader
            value={option.images}
            onChange={(images) => updateOption(index, { images })}
            pathPrefix={`products/${slug || "nuevo"}/steps/${stepId}/${option.id}`}
            label="Imagen"
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...options, emptyOption()])}
      >
        <Plus className="w-4 h-4 mr-1.5" />
        Agregar opción
      </Button>
    </div>
  );
}
