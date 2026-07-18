export interface OptionGroup {
  id: string;
  name: string;
  order: number;
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
  tabImage: string;
  description: string;
  longDescription: string;
  features: string[];
  images: string[];
  videos: string[];
  basePrice: number;
  discountPercent: number;
  published: boolean;
  order: number;
  steps: ConfigStep[];
  createdAt: number;
  updatedAt: number;
}

export function computeFinalPrice(
  product: Product,
  selections: Record<string, string>
): number {
  const discounted = product.basePrice * (1 - product.discountPercent / 100);
  const modifiers = product.steps.reduce((sum, step) => {
    const optionId = selections[step.id];
    const option = step.options.find((o) => o.id === optionId);
    return sum + (option?.priceModifier ?? 0);
  }, 0);
  return discounted + modifiers;
}
