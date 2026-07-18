export interface OptionGroup {
  id: string;
  name: string;
  order: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  price: number;
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
  order: number;
  steps: ConfigStep[];
  createdAt: number;
  updatedAt: number;
}

export type PaymentMethod = "cash" | "installments";

export function computeFinalPrice(
  product: Product,
  selections: Record<string, string>,
  paymentMethod: PaymentMethod = "cash"
): number {
  const modifiers = product.steps.reduce((sum, step) => {
    const optionId = selections[step.id];
    const option = step.options.find((o) => o.id === optionId);
    return sum + (option?.priceModifier ?? 0);
  }, 0);
  const base = paymentMethod === "installments" ? product.basePrice : product.cashPrice;
  return base + modifiers;
}
