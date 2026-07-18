"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadAdminFile } from "@/lib/admin-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";
import { PriceCard } from "@/components/price-card";
import { Plus, Trash2, GripVertical, AlertCircle, ImagePlus, Loader2 } from "lucide-react";
import type { Product, ConfigStep, ConfigOption, OptionGroup } from "@/lib/product-types";
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

function emptyOption(groupId?: string): ConfigOption {
  return { id: newId(), label: "", images: [], priceModifier: 0, groupId };
}

function labelFromFilename(filename: string) {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function emptyStep(order: number): ConfigStep {
  return { id: newId(), name: "", order, groups: [], options: [emptyOption()] };
}

function emptyGroup(order: number): OptionGroup {
  return { id: newId(), name: "", order };
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
    cashPrice: 0,
    installments: 1,
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

          <div className="space-y-2">
            <Label htmlFor="order">Orden</Label>
            <Input
              id="order"
              type="number"
              className="max-w-32"
              value={form.order}
              onChange={(e) => update("order", Number(e.target.value))}
            />
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
          <CardTitle>Precio y cuotas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">Precio de lista</Label>
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
              <Label htmlFor="cashPrice">Precio contado / transferencia</Label>
              <Input
                id="cashPrice"
                type="number"
                min={0}
                step="0.01"
                value={form.cashPrice}
                onChange={(e) => update("cashPrice", Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                No se calcula automático del precio de lista, se carga directo.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="installments">Cantidad de cuotas</Label>
              <Input
                id="installments"
                type="number"
                min={1}
                value={form.installments}
                onChange={(e) => update("installments", Math.max(1, Number(e.target.value)))}
              />
              <p className="text-xs text-muted-foreground">1 = no muestra el bloque de cuotas</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Vista previa</Label>
            <PriceCard
              basePrice={form.basePrice}
              cashPrice={form.cashPrice}
              installments={form.installments}
            />
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

          <GroupsEditor
            groups={step.groups}
            onChange={(groups) => {
              const removedIds = step.groups
                .filter((g) => !groups.some((ng) => ng.id === g.id))
                .map((g) => g.id);
              const options = removedIds.length
                ? step.options.map((o) =>
                    removedIds.includes(o.groupId ?? "") ? { ...o, groupId: undefined } : o
                  )
                : step.options;
              updateStep(index, { groups, options });
            }}
          />

          <OptionsEditor
            options={step.options}
            groups={step.groups}
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

function GroupsEditor({
  groups,
  onChange,
}: {
  groups: OptionGroup[];
  onChange: (groups: OptionGroup[]) => void;
}) {
  const updateGroup = (index: number, name: string) => {
    const next = [...groups];
    next[index] = { ...next[index], name };
    onChange(next);
  };

  const removeGroup = (index: number) => {
    onChange(groups.filter((_, i) => i !== index).map((g, i) => ({ ...g, order: i })));
  };

  return (
    <div className="pl-6 space-y-2">
      <Label className="text-xs text-muted-foreground">
        Subcategorías (opcional, ej: Nacionales / Internacionales)
      </Label>
      {groups.map((group, index) => (
        <div key={group.id} className="flex gap-2">
          <Input
            placeholder="Nombre de la subcategoría"
            value={group.name}
            onChange={(e) => updateGroup(index, e.target.value)}
            className="max-w-xs"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeGroup(index)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...groups, emptyGroup(groups.length)])}
      >
        <Plus className="w-4 h-4 mr-1.5" />
        Agregar subcategoría
      </Button>
    </div>
  );
}

function OptionCard({
  option,
  groups,
  slug,
  stepId,
  onUpdate,
  onRemove,
}: {
  option: ConfigOption;
  groups: OptionGroup[];
  slug: string;
  stepId: string;
  onUpdate: (patch: Partial<ConfigOption>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-secondary/20 rounded-md p-3 space-y-2">
      <div className="flex gap-2 items-start">
        <div className="flex-1 space-y-2">
          <Input
            placeholder="Nombre de la opción (ej: River Plate)"
            value={option.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
          />
          {groups.length > 0 && (
            <div className="flex items-center gap-2">
              <Label htmlFor={`group-${option.id}`} className="text-xs shrink-0">
                Subcategoría
              </Label>
              <select
                id={`group-${option.id}`}
                value={option.groupId ?? ""}
                onChange={(e) => onUpdate({ groupId: e.target.value || undefined })}
                className="w-48 h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs dark:bg-input/30"
              >
                <option value="">Sin subcategoría</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name || "(sin nombre)"}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Label htmlFor={`price-${option.id}`} className="text-xs shrink-0">
              Precio adicional
            </Label>
            <Input
              id={`price-${option.id}`}
              type="number"
              step="0.01"
              value={option.priceModifier}
              onChange={(e) => onUpdate({ priceModifier: Number(e.target.value) })}
              className="w-32"
            />
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <ImageUploader
        value={option.images}
        onChange={(images) => onUpdate({ images })}
        pathPrefix={`products/${slug || "nuevo"}/steps/${stepId}/${option.id}`}
        label="Imagen"
      />
    </div>
  );
}

function BulkOptionUploader({
  slug,
  stepId,
  groupId,
  onCreate,
}: {
  slug: string;
  stepId: string;
  groupId?: string;
  onCreate: (options: ConfigOption[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const created = await Promise.all(
        Array.from(files).map(async (file) => {
          const optionId = newId();
          const pathPrefix = `products/${slug || "nuevo"}/steps/${stepId}/${optionId}`;
          const url = await uploadAdminFile(file, pathPrefix);
          return {
            id: optionId,
            label: labelFromFilename(file.name),
            images: [url],
            priceModifier: 0,
            groupId,
          } satisfies ConfigOption;
        })
      );
      onCreate(created);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
        ) : (
          <ImagePlus className="w-4 h-4 mr-1.5" />
        )}
        Crear opciones desde imágenes
      </Button>
    </>
  );
}

function OptionsEditor({
  options,
  groups,
  slug,
  stepId,
  onChange,
}: {
  options: ConfigOption[];
  groups: OptionGroup[];
  slug: string;
  stepId: string;
  onChange: (options: ConfigOption[]) => void;
}) {
  const updateOption = (id: string, patch: Partial<ConfigOption>) => {
    onChange(options.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  };

  const removeOption = (id: string) => {
    onChange(options.filter((o) => o.id !== id));
  };

  const addOption = (groupId?: string) => {
    onChange([...options, emptyOption(groupId)]);
  };

  const addBulkOptions = (created: ConfigOption[]) => {
    onChange([...options, ...created]);
  };

  const ungrouped = options.filter(
    (o) => !o.groupId || !groups.some((g) => g.id === o.groupId)
  );

  const sections = [
    { id: undefined as string | undefined, name: null as string | null, options: ungrouped },
    ...groups.map((group) => ({
      id: group.id,
      name: group.name || "(sin nombre)",
      options: options.filter((o) => o.groupId === group.id),
    })),
  ];

  return (
    <div className="pl-6 space-y-5">
      {sections.map((section) => (
        <div key={section.id ?? "ungrouped"} className="space-y-2">
          {section.name && (
            <p className="text-sm font-medium text-muted-foreground">{section.name}</p>
          )}

          <div className="space-y-3">
            {section.options.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                groups={groups}
                slug={slug}
                stepId={stepId}
                onUpdate={(patch) => updateOption(option.id, patch)}
                onRemove={() => removeOption(option.id)}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addOption(section.id)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Agregar opción
            </Button>
            <BulkOptionUploader
              slug={slug}
              stepId={stepId}
              groupId={section.id}
              onCreate={addBulkOptions}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
