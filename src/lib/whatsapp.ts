import { computeFinalPrice, type Product } from "@/lib/product-types";

const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "";

function formatPrice(value: number): string {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

export function buildWhatsappMessage(
  product: Product,
  selections: Record<string, string>
): string {
  const lines = [`¡Hola! Quiero comprar este metegol:`, "", `*${product.name}*`];

  const hasSteps = product.steps.length > 0;

  if (hasSteps) {
    lines.push("");
    for (const step of product.steps) {
      const option = step.options.find((o) => o.id === selections[step.id]);
      if (option) {
        lines.push(`- ${step.name}: ${option.label}`);
      }
    }

    const finalPrice = computeFinalPrice(product, selections);
    lines.push("");
    if (product.discountPercent > 0) {
      lines.push(
        `Precio base: ${formatPrice(product.basePrice)} (-${product.discountPercent}%)`
      );
    }
    lines.push(`Precio estimado: ${formatPrice(finalPrice)}`);
  } else {
    lines.push("", `Precio: ${formatPrice(product.basePrice)}`);
  }

  lines.push("", "¿Me pasás más info?");

  return lines.join("\n");
}

export function buildWhatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
