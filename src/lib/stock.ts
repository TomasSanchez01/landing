import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase-admin";

// Control de stock de producción. Estructura en Firestore:
//   stock/{producto}/parts/{piezaId}   -> { qty, ts? }   (ts = último ingreso)
//   stock/{producto}/movs/{id}         -> movimientos de ingreso/egreso
//   stock/{producto}/sales/{id}        -> ventas (descuentan piezas) + estado del pedido
//   stock/{producto}/compras/{id}      -> lista de compras

export const STOCK_PRODUCTS = ["capo", "iron", "finger", "mini"] as const;
export type StockProduct = (typeof STOCK_PRODUCTS)[number];

const LOG_COLLECTIONS = ["movs", "sales", "compras"] as const;
type LogCollection = (typeof LOG_COLLECTIONS)[number];

const ID_RE = /^[A-Za-z0-9_-]{1,100}$/;

export function isStockProduct(p: unknown): p is StockProduct {
  return typeof p === "string" && (STOCK_PRODUCTS as readonly string[]).includes(p);
}

function productRef(p: StockProduct) {
  return getDb().collection("stock").doc(p);
}

type Doc = Record<string, unknown> & { id: string };

export async function getStockState(p: StockProduct) {
  const ref = productRef(p);
  const [parts, movs, sales, compras] = await Promise.all([
    ref.collection("parts").get(),
    ref.collection("movs").orderBy("ts", "desc").limit(10).get(),
    ref.collection("sales").orderBy("ts", "desc").limit(500).get(),
    ref.collection("compras").orderBy("ts", "desc").limit(300).get(),
  ]);
  const map = (s: FirebaseFirestore.QuerySnapshot): Doc[] => s.docs.map((d) => ({ ...d.data(), id: d.id }));
  return { parts: map(parts), movs: map(movs), sales: map(sales), compras: map(compras) };
}

/** Unidades en fabricación (ventas no anuladas y no despachadas) por producto. */
export async function getStockSummary() {
  const entries = await Promise.all(
    STOCK_PRODUCTS.map(async (p) => {
      const snap = await productRef(p).collection("sales").orderBy("ts", "desc").limit(500).get();
      const n = snap.docs.reduce((t, d) => {
        const s = d.data();
        return !s.undone && (s.estado || 0) < 6 ? t + (s.n || 1) : t;
      }, 0);
      return [p, n] as const;
    })
  );
  return Object.fromEntries(entries) as Record<StockProduct, number>;
}

export type StockOp =
  | { t: "part"; id: string; qty: number; ts?: number }
  | { t: "inc"; id: string; delta: number; ts?: number }
  | { t: "add"; col: LogCollection; data: Record<string, unknown> }
  | { t: "update"; col: LogCollection; id: string; data: Record<string, unknown> };

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isCol = (v: unknown): v is LogCollection =>
  typeof v === "string" && (LOG_COLLECTIONS as readonly string[]).includes(v);

export function parseOps(raw: unknown): StockOp[] {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 200) throw new Error("ops inválidas");
  return raw.map((o) => {
    if (!isObj(o)) throw new Error("op inválida");
    const ts = o.ts === undefined ? undefined : isNum(o.ts) ? o.ts : NaN;
    if (Number.isNaN(ts)) throw new Error("ts inválido");
    switch (o.t) {
      case "part":
        if (typeof o.id !== "string" || !ID_RE.test(o.id) || !isNum(o.qty) || o.qty < 0) throw new Error("part inválido");
        return { t: "part", id: o.id, qty: Math.floor(o.qty), ts };
      case "inc":
        if (typeof o.id !== "string" || !ID_RE.test(o.id) || !isNum(o.delta)) throw new Error("inc inválido");
        return { t: "inc", id: o.id, delta: Math.trunc(o.delta), ts };
      case "add":
        if (!isCol(o.col) || !isObj(o.data)) throw new Error("add inválido");
        return { t: "add", col: o.col, data: o.data };
      case "update":
        if (!isCol(o.col) || typeof o.id !== "string" || !ID_RE.test(o.id) || !isObj(o.data))
          throw new Error("update inválido");
        return { t: "update", col: o.col, id: o.id, data: o.data };
      default:
        throw new Error("tipo de op desconocido");
    }
  });
}

/** Aplica todas las operaciones de forma atómica (un solo batch). */
export async function applyStockOps(p: StockProduct, ops: StockOp[]) {
  const ref = productRef(p);
  const batch = getDb().batch();
  const ids: string[] = [];

  for (const op of ops) {
    if (op.t === "part" || op.t === "inc") {
      const qty = op.t === "part" ? op.qty : FieldValue.increment(op.delta);
      // merge: un egreso no borra la fecha del último ingreso
      batch.set(ref.collection("parts").doc(op.id), op.ts ? { qty, ts: op.ts } : { qty }, { merge: true });
    } else if (op.t === "add") {
      const doc = ref.collection(op.col).doc();
      const { id: _ignored, ...data } = op.data;
      void _ignored;
      batch.set(doc, data);
      ids.push(doc.id);
    } else {
      const { id: _ignored, ...data } = op.data;
      void _ignored;
      batch.update(ref.collection(op.col).doc(op.id), data);
    }
  }

  await batch.commit();
  return ids;
}
