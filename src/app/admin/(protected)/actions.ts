"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/firebase-admin";
import { getAdminSession } from "@/lib/admin-session";
import { saveSiteSettings, type SiteSettings } from "@/lib/settings";
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
  const product: Product = {
    ...input,
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
    id,
    createdAt: (existing.data() as Product).createdAt,
    updatedAt: Date.now(),
  };

  await docRef.set(product);
  revalidatePublicPaths(product.slug);
  revalidatePublicPaths((existing.data() as Product).slug);
  redirect("/admin");
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
