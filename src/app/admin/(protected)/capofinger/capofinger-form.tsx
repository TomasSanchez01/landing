"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Plus, Trash2 } from "lucide-react";
import { updateCapofingerSettings } from "../actions";

export function CapofingerForm({ dares: initialDares }: { dares: string[] }) {
  const [dares, setDares] = useState<string[]>(initialDares);
  const [newDare, setNewDare] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const addDare = () => {
    const value = newDare.trim();
    if (!value) return;
    setDares((prev) => [...prev, value]);
    setNewDare("");
  };

  const removeDare = (index: number) => {
    setDares((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDare = (index: number, value: string) => {
    setDares((prev) => prev.map((d, i) => (i === index ? value : d)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    const cleaned = dares.map((d) => d.trim()).filter(Boolean);

    startTransition(async () => {
      try {
        await updateCapofingerSettings({ dares: cleaned });
        setDares(cleaned);
        setSaved(true);
      } catch {
        setError("No se pudo guardar. Intentá de nuevo.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {dares.map((dare, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input value={dare} onChange={(e) => updateDare(index, e.target.value)} />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeDare(index)}
              title="Eliminar consigna"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {dares.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay consignas cargadas. El juego no va a pedir ninguna hasta que agregues al menos
            una.
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={newDare}
          onChange={(e) => setNewDare(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addDare();
            }
          }}
          placeholder="Nueva consigna (ej: Imitá el festejo de Messi)"
        />
        <Button type="button" variant="outline" onClick={addDare}>
          <Plus className="w-4 h-4 mr-1.5" />
          Agregar
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

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
