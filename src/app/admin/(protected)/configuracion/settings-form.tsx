"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Plus, Trash2 } from "lucide-react";
import type { ShippingZone, SiteSettings } from "@/lib/settings";
import { updateSiteSettings } from "../actions";

function newId() {
  return crypto.randomUUID();
}

function emptyZone(): ShippingZone {
  return { id: newId(), name: "", price: 0 };
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [whatsappPhone, setWhatsappPhone] = useState(settings.whatsappPhone);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>(settings.shippingZones);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const updateZone = (id: string, patch: Partial<ShippingZone>) => {
    setShippingZones((zones) => zones.map((z) => (z.id === id ? { ...z, ...patch } : z)));
  };

  const removeZone = (id: string) => {
    setShippingZones((zones) => zones.filter((z) => z.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    startTransition(async () => {
      try {
        await updateSiteSettings({
          whatsappPhone: whatsappPhone.trim(),
          shippingZones: shippingZones.filter((z) => z.name.trim()),
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
          <CardTitle>WhatsApp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="whatsappPhone">Número de WhatsApp</Label>
            <Input
              id="whatsappPhone"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              placeholder="5493416841105"
            />
            <p className="text-xs text-muted-foreground">
              Con código de país, sin espacios ni signos (ej: 5493416841105). Es el número al
              que llegan las cotizaciones de los clientes.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zonas de envío</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            El cliente elige una de estas zonas al cotizar; el precio se suma al precio final.
          </p>

          {shippingZones.map((zone) => (
            <div key={zone.id} className="flex gap-2 items-center">
              <Input
                placeholder="Nombre de la zona (ej: CABA)"
                value={zone.name}
                onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                className="flex-1"
              />
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="Precio"
                value={zone.price}
                onChange={(e) => updateZone(zone.id, { price: Number(e.target.value) })}
                className="w-32"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeZone(zone.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShippingZones((zones) => [...zones, emptyZone()])}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Agregar zona
          </Button>
        </CardContent>
      </Card>

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
        {isPending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
