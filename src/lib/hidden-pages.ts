import "server-only";
import { getDb } from "@/lib/firebase-admin";

export interface HiddenPageSection {
  id: string;
  title: string;
  body: string;
  image?: string;
}

export interface HiddenPage {
  id: string;
  /** Path público, ej: "garantia/producto" -> /garantia/producto. Inmutable una vez creada. */
  slug: string;
  /** Nombre interno para identificarla en el listado del admin. */
  name: string;
  title: string;
  intro: string;
  sections: HiddenPageSection[];
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

const COLLECTION = "hiddenPages";

const RESERVED_SLUGS = new Set(["admin", "producto", "manualdeusuario", "api"]);

export function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .split("/")
    .map((part) =>
      part
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "")
    )
    .filter(Boolean)
    .join("/");
}

export async function getAllHiddenPages(): Promise<HiddenPage[]> {
  const snapshot = await getDb().collection(COLLECTION).orderBy("createdAt", "asc").get();
  return snapshot.docs.map((doc) => doc.data() as HiddenPage);
}

export async function getHiddenPageById(id: string): Promise<HiddenPage | null> {
  const doc = await getDb().collection(COLLECTION).doc(id).get();
  return doc.exists ? (doc.data() as HiddenPage) : null;
}

export async function getHiddenPageBySlug(slug: string): Promise<HiddenPage | null> {
  const snapshot = await getDb().collection(COLLECTION).where("slug", "==", slug).limit(1).get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as HiddenPage;
}

export type HiddenPageInput = Omit<HiddenPage, "id" | "createdAt" | "updatedAt">;

export async function createHiddenPage(input: HiddenPageInput): Promise<string> {
  const slug = normalizeSlug(input.slug);
  if (!slug) throw new Error("La URL no puede estar vacía");
  if (RESERVED_SLUGS.has(slug.split("/")[0])) {
    throw new Error("Esa URL está reservada para el sitio, elegí otra");
  }

  const existing = await getHiddenPageBySlug(slug);
  if (existing) throw new Error("Ya existe una página con esa URL");

  const docRef = getDb().collection(COLLECTION).doc();
  const now = Date.now();
  const page: HiddenPage = { ...input, slug, id: docRef.id, createdAt: now, updatedAt: now };
  await docRef.set(page);
  return docRef.id;
}

export async function updateHiddenPage(
  id: string,
  input: Omit<HiddenPageInput, "slug">
): Promise<void> {
  const docRef = getDb().collection(COLLECTION).doc(id);
  const existing = await docRef.get();
  if (!existing.exists) throw new Error("Página no encontrada");

  const current = existing.data() as HiddenPage;
  const page: HiddenPage = {
    ...current,
    ...input,
    id,
    slug: current.slug,
    updatedAt: Date.now(),
  };
  await docRef.set(page);
}

export async function deleteHiddenPage(id: string): Promise<void> {
  await getDb().collection(COLLECTION).doc(id).delete();
}
