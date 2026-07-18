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
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    startTransition(async () => {
      try {
        await updateSiteSettings({ whatsappPhone: whatsappPhone.trim() });
        setSaved(true);
      } catch {
        setError("No se pudo guardar. Intentá de nuevo.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp</CardTitle>
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
