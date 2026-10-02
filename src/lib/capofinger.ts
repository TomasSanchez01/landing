import "server-only";
import { getDb } from "@/lib/firebase-admin";

const COLLECTION = "settings";
const DOC_ID = "capofinger";

// Consignas con las que arranca el juego la primera vez (antes de guardar nada
// desde el admin). Una vez que se guarda por primera vez desde /admin/capofinger,
// la lista completa (con ediciones y borrados incluidos) pasa a vivir en Firestore.
export const DEFAULT_DARES: string[] = [
  "Contá tu momento más vergonzoso en público",
  "Imitá a un jugador de fútbol festejando un gol",
  "Mostrá la última foto de tu galería",
  "Cantá el himno de tu club a todo pulmón",
  "Hacé 10 sentadillas ahora mismo",
  "Decí tres cosas que admirás del rival",
  "Confesá un secreto futbolero",
  "Hablá como relator hasta el próximo gol",
  "Hacé tu mejor baile de festejo",
  "Contá tu peor papelón en una cancha",
  "Dejá que el rival te ponga un apodo por hoy",
  "Llamá a alguien y decile 'te quiero' sin explicar",
  "Mostrá tu último mensaje enviado",
  "Imitá a alguien de la mesa hasta que adivinen",
  "Decí un trabalenguas 3 veces rápido",
  "Contá tu primer amor del colegio",
  "Hacé una promesa y cumplila hoy",
  "Tomá un trago de lo que haya sin respirar",
  "Elegí un jugador del que seas hincha secreto y explicá por qué",
  "Mostrá tu mejor cara de llanto de VAR",
];

export interface CapofingerSettings {
  dares: string[];
}

const DEFAULT_SETTINGS: CapofingerSettings = { dares: DEFAULT_DARES };

export async function getCapofingerSettings(): Promise<CapofingerSettings> {
  const doc = await getDb().collection(COLLECTION).doc(DOC_ID).get();
  if (!doc.exists) return DEFAULT_SETTINGS;
  const data = doc.data() as Partial<CapofingerSettings>;
  return { dares: data.dares ?? DEFAULT_DARES };
}

export async function saveCapofingerSettings(settings: CapofingerSettings): Promise<void> {
  await getDb().collection(COLLECTION).doc(DOC_ID).set(settings);
}
