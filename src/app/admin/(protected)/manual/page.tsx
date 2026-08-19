import { getManualContent } from "@/lib/manual";
import { getSiteSettings } from "@/lib/settings";
import { ManualForm } from "./manual-form";

export default async function ManualAdminPage() {
  const [content, settings] = await Promise.all([getManualContent(), getSiteSettings()]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Manual de usuario</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Página oculta en <code className="text-xs">/manualdeusuario/info</code>. No aparece en
          ningún menú del sitio, solo es accesible para quien tenga el link. Podés habilitarla o
          deshabilitarla desde{" "}
          <a href="/admin/configuracion" className="underline">
            Configuración
          </a>{" "}
          (actualmente está {settings.manualUsuarioEnabled ? "habilitada" : "deshabilitada"}).
        </p>
      </div>
      <ManualForm content={content} />
    </div>
  );
}
