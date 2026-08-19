"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { updateSiteSettings } from "../actions";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [whatsappPhone, setWhatsappPhone] = useState(settings.whatsappPhone);
  const [whatsappConsultasPhone, setWhatsappConsultasPhone] = useState(
    settings.whatsappConsultasPhone
  );
  const [manualUsuarioEnabled, setManualUsuarioEnabled] = useState(
    settings.manualUsuarioEnabled
  );
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    startTransition(async () => {
      try {
        await updateSiteSettings({
          whatsappPhone: whatsappPhone.trim(),
          whatsappConsultasPhone: whatsappConsultasPhone.trim(),
          manualUsuarioEnabled,
        });
        setSaved(true);
      } catch {
        setError("No se pudo guardar. Intentá de nuevo.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="whatsappConsultasPhone">
              Número de WhatsApp para consultas (opcional)
            </Label>
            <Input
              id="whatsappConsultasPhone"
              value={whatsappConsultasPhone}
              onChange={(e) => setWhatsappConsultasPhone(e.target.value)}
              placeholder="5493416841105"
            />
            <p className="text-xs text-muted-foreground">
              Es el número del botón flotante de WhatsApp que se muestra en toda la web. Si lo
              dejás vacío, se usa el mismo número de arriba.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <input
              id="manualUsuarioEnabled"
              type="checkbox"
              checked={manualUsuarioEnabled}
              onChange={(e) => setManualUsuarioEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="manualUsuarioEnabled">
              Manual de usuario habilitado (/manualdeusuario/info)
            </Label>
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
            {isPending ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
