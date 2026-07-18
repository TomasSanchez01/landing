import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export default async function ConfiguracionPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Configuración del sitio</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
