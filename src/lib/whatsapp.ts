import { computeFinalPrice, type PaymentMethod, type Product } from "@/lib/product-types";
import { formatPrice } from "@/lib/format";

export function buildWhatsappMessage(
  product: Product,
  selections: Record<string, string>,
  paymentMethod: PaymentMethod = "cash"
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

    const finalPrice = computeFinalPrice(product, selections, paymentMethod);
    lines.push("");

    if (paymentMethod === "installments" && product.installments > 1) {
      lines.push(`Forma de pago: ${product.installments} cuotas`);
      lines.push(`Precio total en cuotas: ${formatPrice(finalPrice)}`);
    } else {
      lines.push(`Forma de pago: Contado / transferencia`);
      lines.push(`Precio estimado: ${formatPrice(finalPrice)}`);
    }
  } else {
    lines.push("", `Precio: ${formatPrice(product.cashPrice)}`);
  }

  lines.push("", "¿Me pasás más info?");

  return lines.join("\n");
}

export function buildWhatsappUrl(message: string, phone: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
