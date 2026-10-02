import { getCapofingerSettings } from "@/lib/capofinger";
import { CapofingerForm } from "./capofinger-form";

export default async function CapofingerAdminPage() {
  const settings = await getCapofingerSettings();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Minijuego CapoFinger</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Consignas (prendas) que les toca cumplir a los jugadores cuando meten un gol. Podés
          editar o borrar cualquiera, incluidas las que vienen de fábrica, y agregar las que
          quieras. Se juega en{" "}
          <a href="/games/capofinger.html" target="_blank" rel="noopener noreferrer" className="underline">
            /games/capofinger.html
          </a>
          .
        </p>
      </div>

      <CapofingerForm dares={settings.dares} />
    </div>
  );
}
