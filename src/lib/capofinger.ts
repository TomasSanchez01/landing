import "server-only";
import { getDb } from "@/lib/firebase-admin";
import type { CapofingerQuestion } from "@/lib/capofinger-types";

const COLLECTION = "settings";
const DOC_ID = "capofinger";

// Preguntas con las que arranca el juego la primera vez (antes de guardar nada
// desde el admin). Una vez que se guarda por primera vez desde /admin/capofinger,
// la lista completa (con ediciones y borrados incluidos) pasa a vivir en Firestore.
export const DEFAULT_QUESTIONS: CapofingerQuestion[] = [
  {
    question: "¿Cuántos Mundiales ganó Argentina?",
    correct: "3",
    wrong1: "2",
    wrong2: "4",
  },
  {
    question: "¿En qué país se jugó el Mundial 2022?",
    correct: "Qatar",
    wrong1: "Arabia Saudita",
    wrong2: "Emiratos Árabes",
  },
  {
    question: "¿Quién es el máximo goleador de la historia de los Mundiales?",
    correct: "Miroslav Klose",
    wrong1: "Ronaldo Nazário",
    wrong2: "Pelé",
  },
  {
    question: "¿En qué año ganó Argentina su primer Mundial?",
    correct: "1978",
    wrong1: "1986",
    wrong2: "1974",
  },
  {
    question: "¿Qué país ganó el primer Mundial, en 1930?",
    correct: "Uruguay",
    wrong1: "Argentina",
    wrong2: "Brasil",
  },
  {
    question: "¿Contra qué selección fue el gol del siglo de Maradona?",
    correct: "Inglaterra",
    wrong1: "Alemania",
    wrong2: "Bélgica",
  },
  {
    question: "¿En qué estadio se jugó la final del Mundial 2022?",
    correct: "Lusail",
    wrong1: "Al Bayt",
    wrong2: "Khalifa",
  },
  {
    question: "¿Cuántas Copas Libertadores ganó Independiente?",
    correct: "7",
    wrong1: "5",
    wrong2: "9",
  },
  {
    question: "¿Cuántos minutos dura un partido sin alargue?",
    correct: "90",
    wrong1: "80",
    wrong2: "100",
  },
  {
    question: "¿Quién fue el DT campeón del mundo en 1986?",
    correct: "Carlos Bilardo",
    wrong1: "César Menotti",
    wrong2: "Marcelo Bielsa",
  },
  {
    question: "¿Quién fue el DT campeón del mundo en 1978?",
    correct: "César Menotti",
    wrong1: "Carlos Bilardo",
    wrong2: "José Pekerman",
  },
  {
    question: "¿Quién fue el DT campeón del mundo en 2022?",
    correct: "Lionel Scaloni",
    wrong1: "Jorge Sampaoli",
    wrong2: "Alfio Basile",
  },
  {
    question: "¿Cuántas Champions League ganó Messi?",
    correct: "4",
    wrong1: "3",
    wrong2: "5",
  },
  {
    question: "¿Quién tiene más Balones de Oro?",
    correct: "Lionel Messi",
    wrong1: "Cristiano Ronaldo",
    wrong2: "Johan Cruyff",
  },
  {
    question: "¿Cuántos Mundiales ganó Brasil?",
    correct: "5",
    wrong1: "4",
    wrong2: "6",
  },
  {
    question: "¿Quién convirtió el gol de la \"Mano de Dios\"?",
    correct: "Diego Maradona",
    wrong1: "Jorge Valdano",
    wrong2: "Claudio Caniggia",
  },
  {
    question: "¿Quién marcó el gol del triunfo en la final de 1986?",
    correct: "Burruchaga",
    wrong1: "Valdano",
    wrong2: "Maradona",
  },
  {
    question: "¿Contra quién ganó Argentina la final de 2022?",
    correct: "Francia",
    wrong1: "Croacia",
    wrong2: "Países Bajos",
  },
  {
    question: "¿Cuál es el apodo de la selección de Uruguay?",
    correct: "La Celeste",
    wrong1: "La Roja",
    wrong2: "La Canarinha",
  },
  {
    question: "¿Cuánto mide de ancho un arco reglamentario?",
    correct: "7,32 m",
    wrong1: "6,32 m",
    wrong2: "8,32 m",
  },
  {
    question: "¿Cuántos puntos da una victoria?",
    correct: "3",
    wrong1: "2",
    wrong2: "4",
  },
  {
    question: "¿De qué color es la tarjeta que expulsa?",
    correct: "Roja",
    wrong1: "Amarilla",
    wrong2: "Azul",
  },
  {
    question: "¿Cuál es el apodo de Boca Juniors?",
    correct: "Xeneize",
    wrong1: "Millonario",
    wrong2: "Pincharrata",
  },
  {
    question: "¿En qué ciudad nació Lionel Messi?",
    correct: "Rosario",
    wrong1: "Buenos Aires",
    wrong2: "Córdoba",
  },
  {
    question: "¿Qué club juega en el Coloso del Parque?",
    correct: "Newell's",
    wrong1: "Rosario Central",
    wrong2: "Racing",
  },
  {
    question: "¿Cuántos goles hizo Messi en el Mundial 2022?",
    correct: "7",
    wrong1: "5",
    wrong2: "9",
  },
  {
    question: "¿Quién ganó el Mundial 2018?",
    correct: "Francia",
    wrong1: "Croacia",
    wrong2: "Bélgica",
  },
  {
    question: "¿Cuál es el apodo de Diego Maradona?",
    correct: "El Pibe de Oro",
    wrong1: "El Fenómeno",
    wrong2: "El Kaiser",
  },
  {
    question: "¿Cuántos Mundiales ganó Alemania?",
    correct: "4",
    wrong1: "3",
    wrong2: "5",
  },
  {
    question: "¿En qué país se juega la Premier League?",
    correct: "Inglaterra",
    wrong1: "España",
    wrong2: "Italia",
  },
  {
    question: "¿Cuántos jugadores tiene cada equipo en cancha?",
    correct: "11",
    wrong1: "9",
    wrong2: "10",
  },
];

export interface CapofingerSettings {
  questions: CapofingerQuestion[];
}

const DEFAULT_SETTINGS: CapofingerSettings = { questions: DEFAULT_QUESTIONS };

export async function getCapofingerSettings(): Promise<CapofingerSettings> {
  const doc = await getDb().collection(COLLECTION).doc(DOC_ID).get();
  if (!doc.exists) return DEFAULT_SETTINGS;
  const data = doc.data() as Partial<CapofingerSettings>;
  return { questions: data.questions ?? DEFAULT_QUESTIONS };
}

export async function saveCapofingerSettings(settings: CapofingerSettings): Promise<void> {
  // merge para no pisar las consignas viejas (dares) que quedaron en el documento.
  await getDb().collection(COLLECTION).doc(DOC_ID).set(settings, { merge: true });
}
