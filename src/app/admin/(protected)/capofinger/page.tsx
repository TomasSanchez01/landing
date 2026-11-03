import { getCapofingerSettings } from "@/lib/capofinger";
import { CapofingerForm } from "./capofinger-form";

export default async function CapofingerAdminPage() {
  const settings = await getCapofingerSettings();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Minijuego CapoFinger</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preguntas que le tocan al jugador que recibe un gol: si acierta, el gol vale 1; si falla,
          vale 2. Podés editar o borrar cualquiera, incluidas las que vienen de fábrica, y agregar
          las que quieras. Se juega en{" "}
          <a href="/games/capofinger.html" target="_blank" rel="noopener noreferrer" className="underline">
            /games/capofinger.html
          </a>
          .
        </p>
      </div>

      <CapofingerForm questions={settings.questions} />
    </div>
  );
}
