export interface OptionGroup {
  id: string;
  name: string;
  order: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  /** Precio de envío para esta zona. Se ignora si el producto tiene shippingVariantStepId. */
  price: number;
  /** Precio por opción del paso shippingVariantStepId (ej: Fijo/Elevable), keyed por ConfigOption.id. */
  variantPrices?: Record<string, number>;
}

export interface ConfigOption {
  id: string;
  label: string;
  images: string[];
  priceModifier: number;
  description?: string;
  /** Referencia a ConfigStep.groups[].id. Solo agrupa visualmente las opciones del paso (ej: "Nacionales" dentro de "Equipo"); no agrega un paso de selección extra, se elige una sola opción por paso sin importar la subcategoría. */
  groupId?: string;
}

export interface ConfigStep {
  id: string;
  name: string;
  order: number;
  /** Subcategorías opcionales para organizar las opciones (ej: "Nacionales" / "Internacionales" dentro de "Equipo"). */
  groups: OptionGroup[];
  options: ConfigOption[];
  /** Cantidad de opciones que el cliente debe elegir en este paso (ej: 2 para elegir dos equipos). 1 = selección única (default). */
  selectionCount: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Imagen de la tarjeta en la home. */
  tabImage: string;
  /** Imagen del tab en el navbar (distinta a la de la tarjeta de inicio). */
  navbarImage: string;
  description: string;
  longDescription: string;
  features: string[];
  images: string[];
  videos: string[];
  /** Precio de lista / total pagando en cuotas. */
  basePrice: number;
  /** Precio pagando contado/transferencia. Se carga directo, no se calcula como % del basePrice. */
  cashPrice: number;
  /** Cantidad de cuotas para mostrar el precio en cuotas. 1 (o menos) = no se muestra el bloque de cuotas. */
  installments: number;
  published: boolean;
  /** Aparece en la home como "Próximamente" pero no se puede entrar a su página de producto. */
  comingSoon: boolean;
  /** Zonas de envío propias del producto (cada uno pesa distinto, el envío cambia). */
  shippingZones: ShippingZone[];
  /** ConfigStep.id cuya opción elegida determina el precio de envío (ej: Fijo/Elevable en el CAPO 2.0). null = precio fijo por zona. */
  shippingVariantStepId: string | null;
  order: number;
  steps: ConfigStep[];
  createdAt: number;
  updatedAt: number;
}

export type PaymentMethod = "cash" | "installments";

/** Opciones elegidas por el cliente, keyed por ConfigStep.id -> lista de ConfigOption.id elegidos en ese paso. */
export type ConfigSelections = Record<string, string[]>;

export function computeFinalPrice(
  product: Product,
  selections: ConfigSelections,
  paymentMethod: PaymentMethod = "cash"
): number {
  const modifiers = product.steps.reduce((sum, step) => {
    const optionIds = selections[step.id] ?? [];
    const stepSum = optionIds.reduce((s, optionId) => {
      const option = step.options.find((o) => o.id === optionId);
      return s + (option?.priceModifier ?? 0);
    }, 0);
    return sum + stepSum;
  }, 0);
  const base = paymentMethod === "installments" ? product.basePrice : product.cashPrice;
  return base + modifiers;
}

export function computeShippingPrice(
  product: Product,
  zone: ShippingZone | null,
  selections: ConfigSelections
): number {
  if (!zone) return 0;
  if (product.shippingVariantStepId) {
    const optionId = selections[product.shippingVariantStepId]?.[0];
    if (!optionId) return 0;
    return zone.variantPrices?.[optionId] ?? 0;
  }
  return zone.price;
}
