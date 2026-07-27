import {
  computeFinalPrice,
  computeShippingPrice,
  type ConfigSelections,
  type PaymentMethod,
  type Product,
  type ShippingZone,
} from "@/lib/product-types";
import { formatPrice } from "@/lib/format";

export function buildWhatsappMessage(
  product: Product,
  selections: ConfigSelections,
  paymentMethod: PaymentMethod = "cash",
  shippingZone: ShippingZone | null = null
): string {
  const lines = [`¡Hola! Quiero comprar este metegol:`, "", `*${product.name}*`];

  if (product.steps.length > 0) {
    lines.push("");
    for (const step of product.steps) {
      const optionIds = selections[step.id] ?? [];
      const labels = optionIds
        .map((id) => step.options.find((o) => o.id === id)?.label)
        .filter((label): label is string => Boolean(label));
      if (labels.length > 0) {
        lines.push(`- ${step.name}: ${labels.join(", ")}`);
      }
    }
  }

  const shippingPrice = computeShippingPrice(product, shippingZone, selections);
  const finalPrice = computeFinalPrice(product, selections, paymentMethod) + shippingPrice;

  lines.push("");
  if (paymentMethod === "installments" && product.installments > 1) {
    lines.push(`Forma de pago: ${product.installments} cuotas`);
  } else {
    lines.push(`Forma de pago: Contado / transferencia`);
  }

  if (shippingZone) {
    lines.push(`Zona de envío: ${shippingZone.name} (+${formatPrice(shippingPrice)})`);
  }

  lines.push(`Precio estimado: ${formatPrice(finalPrice)}`);
  lines.push("", "¿Me pasás más info?");

  return lines.join("\n");
}

export function buildWhatsappUrl(message: string, phone: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function resolveConsultasPhone(settings: {
  whatsappPhone: string;
  whatsappConsultasPhone: string;
}): string {
  return settings.whatsappConsultasPhone.trim() || settings.whatsappPhone;
}
