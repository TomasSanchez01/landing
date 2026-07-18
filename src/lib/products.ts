import "server-only";
import { getDb } from "@/lib/firebase-admin";
import type { Product } from "@/lib/product-types";

export type { Product, ConfigStep, ConfigOption } from "@/lib/product-types";
export { computeFinalPrice } from "@/lib/product-types";

const COLLECTION = "products";

function normalizeProduct(product: Product): Product {
  // compat: docs guardados antes de reemplazar discountPercent por cashPrice
  const legacyDiscountPercent = (product as unknown as { discountPercent?: number })
    .discountPercent;

  return {
    ...product,
    installments: product.installments ?? 1,
    comingSoon: product.comingSoon ?? false,
    navbarImage: product.navbarImage || product.tabImage,
    shippingVariantStepId: product.shippingVariantStepId ?? null,
    shippingZones: (product.shippingZones ?? []).map((zone) => ({
      ...zone,
      variantPrices: zone.variantPrices ?? {},
    })),
    cashPrice:
      product.cashPrice ??
      (legacyDiscountPercent != null
        ? product.basePrice * (1 - legacyDiscountPercent / 100)
        : product.basePrice),
    steps: [...product.steps]
      .sort((a, b) => a.order - b.order)
      .map((step) => ({
        ...step,
        groups: step.groups ?? [],
        selectionCount: step.selectionCount ?? 1,
      })),
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const snapshot = await getDb().collection(COLLECTION).orderBy("order", "asc").get();
  return snapshot.docs.map((doc) => normalizeProduct(doc.data() as Product));
}

export async function getPublishedProducts(): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.published);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const doc = await getDb().collection(COLLECTION).doc(id).get();
  if (!doc.exists) return undefined;
  return normalizeProduct(doc.data() as Product);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const snapshot = await getDb()
    .collection(COLLECTION)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snapshot.empty) return undefined;
  return normalizeProduct(snapshot.docs[0].data() as Product);
}
