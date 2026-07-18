import { computeFinalPrice, type PaymentMethod, type Product } from "@/lib/product-types";
import type { ShippingZone } from "@/lib/settings";
import { formatPrice } from "@/lib/format";

export function buildWhatsappMessage(
  product: Product,
  selections: Record<string, string>,
  paymentMethod: PaymentMethod = "cash",
  shippingZone: ShippingZone | null = null
): string {
  const lines = [`¡Hola! Quiero comprar este metegol:`, "", `*${product.name}*`];

  if (product.steps.length > 0) {
    lines.push("");
    for (const step of product.steps) {
      const option = step.options.find((o) => o.id === selections[step.id]);
      if (option) {
        lines.push(`- ${step.name}: ${option.label}`);
      }
    }
  }

  const finalPrice = computeFinalPrice(product, selections, paymentMethod) + (shippingZone?.price ?? 0);

  lines.push("");
  if (paymentMethod === "installments" && product.installments > 1) {
    lines.push(`Forma de pago: ${product.installments} cuotas`);
  } else {
    lines.push(`Forma de pago: Contado / transferencia`);
  }

  if (shippingZone) {
    lines.push(`Zona de envío: ${shippingZone.name} (+${formatPrice(shippingZone.price)})`);
  }

  lines.push(`Precio estimado: ${formatPrice(finalPrice)}`);
  lines.push("", "¿Me pasás más info?");

  return lines.join("\n");
}

export function buildWhatsappUrl(message: string, phone: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
