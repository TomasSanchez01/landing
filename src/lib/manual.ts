import "server-only";
import { getDb } from "@/lib/firebase-admin";

export interface ManualSection {
  id: string;
  title: string;
  body: string;
  image?: string;
}

export interface ManualContent {
  intro: string;
  sections: ManualSection[];
}

const COLLECTION = "settings";
const DOC_ID = "manual";

const DEFAULT_MANUAL: ManualContent = {
  intro:
    "Bienvenido al manual de tu metegol Capocannoniere. Acá encontrás cómo armarlo, cómo cuidarlo y las reglas básicas de juego para sacarle el máximo provecho desde el primer partido.",
  sections: [
    {
      id: "armado",
      title: "1. Armado y ubicación",
      body: "Desembalá todas las piezas y verificá que estén completas antes de empezar (mesa, barras, muñecos, patas y kit de tornillería).\n\nArmá el metegol sobre una superficie plana y firme, dejando al menos 60 cm libres a cada lado para que los jugadores puedan moverse con comodidad.\n\nSi elegiste la versión con patas elevables, ajustá los cuatro niveladores hasta que la mesa quede perfectamente horizontal: esto evita que la pelota se vaya sola hacia un costado.",
    },
    {
      id: "primer-uso",
      title: "2. Antes del primer partido",
      body: "Girá todas las barras varias veces en vacío para asentar los rodamientos.\n\nRevisá que los muñecos giren libremente y que ninguno esté trabado contra el borde de la mesa.\n\nApoyá la pelota en el centro y comprobá que no se desvíe: si lo hace, volvé a nivelar las patas.",
    },
    {
      id: "reglas",
      title: "3. Reglas básicas de juego",
      body: "Cada equipo controla cuatro barras: arquero, defensores, mediocampistas y delanteros.\n\nNo se permite girar una barra más de 360° de forma continua ('molinete'): es gol en contra o pérdida de posesión, según lo que hayan acordado los jugadores.\n\nSe gana el punto cuando la pelota entra completa en el arco rival. Se suele jugar al mejor de 5 o 10 goles, o por tiempo.\n\nSi la pelota queda inmóvil y sin que ningún jugador pueda alcanzarla, se reinicia la jugada desde el mediocampo.",
    },
    {
      id: "mantenimiento",
      title: "4. Mantenimiento y cuidados",
      body: "Limpiá la superficie de juego con un paño seco o levemente húmedo; evitá productos abrasivos que puedan dañar la pintura.\n\nRevisá cada 2-3 meses que los tornillos de las patas y las barras sigan ajustados.\n\nSi una barra empieza a girar con dificultad, aplicá unas gotas de aceite lubricante liviano (tipo 3 en 1) en los extremos donde apoya sobre la mesa.\n\nGuardá el metegol en un ambiente seco, lejos de la humedad directa y de la luz solar prolongada, para que los colores no se decoloren.",
    },
    {
      id: "soporte",
      title: "5. ¿Necesitás ayuda?",
      body: "Si te falta alguna pieza, notás algún defecto o tenés dudas sobre el armado, escribinos por WhatsApp desde el botón flotante del sitio y te ayudamos a resolverlo.",
    },
  ],
};

export async function getManualContent(): Promise<ManualContent> {
  const doc = await getDb().collection(COLLECTION).doc(DOC_ID).get();
  if (!doc.exists) return DEFAULT_MANUAL;
  const data = doc.data() as Partial<ManualContent>;
  return {
    intro: data.intro ?? DEFAULT_MANUAL.intro,
    sections: data.sections ?? DEFAULT_MANUAL.sections,
  };
}

export async function saveManualContent(content: ManualContent): Promise<void> {
  await getDb().collection(COLLECTION).doc(DOC_ID).set(content);
}
