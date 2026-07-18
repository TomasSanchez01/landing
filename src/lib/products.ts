import "server-only";
import { db } from "@/lib/firebase-admin";
import type { Product } from "@/lib/product-types";

export type { Product, ConfigStep, ConfigOption } from "@/lib/product-types";
export { computeFinalPrice } from "@/lib/product-types";

const COLLECTION = "products";

function sortSteps(product: Product): Product {
  return {
    ...product,
    steps: [...product.steps]
      .sort((a, b) => a.order - b.order)
      .map((step) => ({ ...step, groups: step.groups ?? [] })),
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const snapshot = await db.collection(COLLECTION).orderBy("order", "asc").get();
  return snapshot.docs.map((doc) => sortSteps(doc.data() as Product));
}

export async function getPublishedProducts(): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.published);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return undefined;
  return sortSteps(doc.data() as Product);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const snapshot = await db
    .collection(COLLECTION)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snapshot.empty) return undefined;
  return sortSteps(snapshot.docs[0].data() as Product);
}
