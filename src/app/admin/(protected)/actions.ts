"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/firebase-admin";
import { getAdminSession } from "@/lib/admin-session";
import { saveSiteSettings, type SiteSettings } from "@/lib/settings";
import { saveManualContent, type ManualContent } from "@/lib/manual";
import {
  createHiddenPage,
  updateHiddenPage,
  deleteHiddenPage,
  getHiddenPageById,
  type HiddenPageInput,
} from "@/lib/hidden-pages";
import type { Product } from "@/lib/product-types";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("No autorizado");
  }
}

function revalidatePublicPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/producto/${slug}`);
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export async function createProduct(input: ProductInput) {
  await requireAdmin();

  const docRef = getDb().collection("products").doc();
  const now = Date.now();

  const lastSnap = await getDb().collection("products").orderBy("order", "desc").limit(1).get();
  const nextOrder = lastSnap.empty ? 0 : (lastSnap.docs[0].data() as Product).order + 1;

  const product: Product = {
    ...input,
    order: nextOrder,
    id: docRef.id,
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(product);
  revalidatePublicPaths(product.slug);
  redirect("/admin");
}

export async function updateProduct(id: string, input: ProductInput) {
  await requireAdmin();

  const docRef = getDb().collection("products").doc(id);
  const existing = await docRef.get();
  if (!existing.exists) {
    throw new Error("Producto no encontrado");
  }

  const product: Product = {
    ...input,
    order: (existing.data() as Product).order,
    id,
    createdAt: (existing.data() as Product).createdAt,
    updatedAt: Date.now(),
  };

  await docRef.set(product);
  revalidatePublicPaths(product.slug);
  revalidatePublicPaths((existing.data() as Product).slug);
  redirect("/admin");
}

export async function reorderProduct(id: string, direction: "up" | "down") {
  await requireAdmin();

  const snapshot = await getDb().collection("products").orderBy("order", "asc").get();
  const ids = snapshot.docs.map((doc) => doc.id);

  const index = ids.indexOf(id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || targetIndex < 0 || targetIndex >= ids.length) return;

  [ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]];

  const batch = getDb().batch();
  ids.forEach((productId, i) => {
    batch.update(getDb().collection("products").doc(productId), { order: i, updatedAt: Date.now() });
  });
  await batch.commit();

  revalidatePublicPaths();
}

export async function deleteProduct(id: string) {
  await requireAdmin();

  const docRef = getDb().collection("products").doc(id);
  const existing = await docRef.get();
  const slug = (existing.data() as Product | undefined)?.slug;

  await docRef.delete();
  revalidatePublicPaths(slug);
}

export async function setPublished(id: string, published: boolean) {
  await requireAdmin();

  const docRef = getDb().collection("products").doc(id);
  await docRef.update({ published, updatedAt: Date.now() });

  const data = (await docRef.get()).data() as Product | undefined;
  revalidatePublicPaths(data?.slug);
}

export async function updateSiteSettings(settings: SiteSettings) {
  await requireAdmin();

  await saveSiteSettings(settings);
  revalidatePath("/", "layout");
}

export async function updateManualContent(content: ManualContent) {
  await requireAdmin();

  await saveManualContent(content);
  revalidatePath("/manualdeusuario/info");
}

export async function createHiddenPageAction(input: HiddenPageInput) {
  await requireAdmin();

  await createHiddenPage(input);
  revalidatePath("/admin/paginas");
  redirect("/admin/paginas");
}

export async function updateHiddenPageAction(id: string, input: Omit<HiddenPageInput, "slug">) {
  await requireAdmin();

  await updateHiddenPage(id, input);
  const page = await getHiddenPageById(id);
  revalidatePath("/admin/paginas");
  if (page) revalidatePath(`/${page.slug}`);
  redirect("/admin/paginas");
}

export async function deleteHiddenPageAction(id: string) {
  await requireAdmin();

  const page = await getHiddenPageById(id);
  await deleteHiddenPage(id);
  revalidatePath("/admin/paginas");
  if (page) revalidatePath(`/${page.slug}`);
}

export async function setHiddenPageEnabledAction(id: string, enabled: boolean) {
  await requireAdmin();

  const page = await getHiddenPageById(id);
  if (!page) throw new Error("Página no encontrada");

  await updateHiddenPage(id, { ...page, enabled });
  revalidatePath("/admin/paginas");
  revalidatePath(`/${page.slug}`);
}
