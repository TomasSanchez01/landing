"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { Check, MessageCircle } from "lucide-react";
import type {
  ConfigOption,
  ConfigSelections,
  ConfigStep,
  PaymentMethod,
  Product,
} from "@/lib/product-types";
import { computeFinalPrice, computeShippingPrice } from "@/lib/product-types";
import { buildWhatsappMessage, buildWhatsappUrl } from "@/lib/whatsapp";

function groupOptions(step: ConfigStep): { ungrouped: ConfigOption[]; named: { id: string; name: string; options: ConfigOption[] }[] } {
  const ungrouped = step.options.filter(
    (o) => !o.groupId || !step.groups.some((g) => g.id === o.groupId)
  );

  const named = [...step.groups]
    .sort((a, b) => a.order - b.order)
    .map((group) => ({
      id: group.id,
      name: group.name,
      options: step.options.filter((o) => o.groupId === group.id),
    }))
    .filter((g) => g.options.length > 0);

  return { ungrouped, named };
}

function OptionCard({
  option,
  isSelected,
  disabled = false,
  onSelect,
  size = "lg",
}: {
  option: ConfigOption;
  isSelected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  size?: "lg" | "sm";
}) {
  const isSmall = size === "sm";

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "text-left rounded-lg border overflow-hidden transition-all shrink-0",
        isSmall ? "w-20" : "w-36 sm:w-40",
        isSelected
          ? "border-primary ring-2 ring-primary/50"
          : "border-border/50 hover:border-primary/50",
        disabled && "opacity-40 pointer-events-none"
      )}
    >
      <div className={cn("relative bg-secondary/20", isSmall ? "aspect-square" : "aspect-4/3")}>
        {option.images[0] && (
          <Image
            src={option.images[0]}
            alt={option.label}
            fill
            className={cn("object-contain", isSmall ? "p-1.5" : "p-2.5")}
            sizes={isSmall ? "80px" : "160px"}
          />
        )}
        {isSelected && (
          <div
            className={cn(
              "absolute bg-primary text-primary-foreground rounded-full",
              isSmall ? "top-1 right-1 p-0.5" : "top-1.5 right-1.5 p-1"
            )}
          >
            <Check className={isSmall ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
          </div>
        )}
      </div>
      <div className={isSmall ? "px-1.5 py-1" : "px-2 py-2"}>
        <p
          className={cn(
            "font-medium leading-tight line-clamp-2",
            isSmall ? "text-[10px]" : "text-xs"
          )}
        >
          {option.label}
        </p>
        {option.priceModifier !== 0 && (
          <p className={cn("text-muted-foreground", isSmall ? "text-[9px]" : "text-[11px]")}>
            {option.priceModifier > 0 ? "+" : ""}
            {formatPrice(option.priceModifier)}
          </p>
        )}
      </div>
    </button>
  );
}

export function ProductConfigurator({
  product,
  whatsappPhone,
}: {
  product: Product;
  whatsappPhone: string;
}) {
  const [selections, setSelections] = useState<ConfigSelections>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    product.installments > 1 ? null : "cash"
  );
  const [shippingZoneId, setShippingZoneId] = useState<string>("");

  const shippingZones = product.shippingZones;
  const needsPaymentChoice = product.installments > 1;
  const needsShipping = shippingZones.length > 0;
  const selectedZone = shippingZones.find((z) => z.id === shippingZoneId) ?? null;
  const shippingVariantStep = product.shippingVariantStepId
    ? product.steps.find((s) => s.id === product.shippingVariantStepId) ?? null
    : null;
  const shippingVariantSelected = shippingVariantStep
    ? Boolean(selections[shippingVariantStep.id]?.length)
    : true;

  const message = buildWhatsappMessage(product, selections, paymentMethod ?? "cash", selectedZone);

  if (product.steps.length === 0 && !needsPaymentChoice && !needsShipping) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-border/50 bg-secondary/20 p-4">
        <div>
          <p className="font-medium">{formatPrice(product.cashPrice)}</p>
          <p className="text-sm text-muted-foreground">
            Consultanos por este producto y te cotizamos al instante.
          </p>
        </div>
        <Button asChild>
          <a href={buildWhatsappUrl(message, whatsappPhone)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4 mr-2" />
            Consultar por WhatsApp
          </a>
        </Button>
      </div>
    );
  }

  const selectOption = (step: ConfigStep, optionId: string) => {
    setSelections((prev) => {
      const current = prev[step.id] ?? [];

      if (step.selectionCount <= 1) {
        return { ...prev, [step.id]: [optionId] };
      }
      if (current.includes(optionId)) {
        return { ...prev, [step.id]: current.filter((id) => id !== optionId) };
      }
      if (current.length >= step.selectionCount) {
        return prev;
      }
      return { ...prev, [step.id]: [...current, optionId] };
    });
  };

  const isStepComplete = (step: ConfigStep) =>
    (selections[step.id]?.length ?? 0) === step.selectionCount;
  const completedStepsCount = product.steps.filter(isStepComplete).length;
  const allStepsSelected = completedStepsCount === product.steps.length;
  const canQuote =
    allStepsSelected &&
    (!needsPaymentChoice || paymentMethod !== null) &&
    (!needsShipping || shippingZoneId !== "");
  const metegolPrice = computeFinalPrice(product, selections, paymentMethod ?? "cash");
  const shippingPrice = computeShippingPrice(product, selectedZone, selections);
  const finalPrice = metegolPrice + shippingPrice;

  const missingLabel = !allStepsSelected
    ? `Faltan ${product.steps.length - completedStepsCount} característica(s) por elegir`
    : needsPaymentChoice && !paymentMethod
    ? "Elegí una forma de pago"
    : needsShipping && !shippingZoneId
    ? "Elegí tu zona de envío"
    : `${completedStepsCount} de ${product.steps.length} características elegidas`;

  const paymentLabel = needsPaymentChoice
    ? paymentMethod === "installments"
      ? `${product.installments} cuotas`
      : "Contado / transferencia"
    : null;

  return (
    <div className="space-y-6 pb-24">
      {product.steps.map((step) => {
        const { ungrouped, named } = groupOptions(step);
        const stepSelections = selections[step.id] ?? [];
        const stepFull = stepSelections.length >= step.selectionCount;

        return (
          <div key={step.id}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold">{step.name}</h3>
              {step.selectionCount > 1 && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    stepSelections.length === step.selectionCount
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  Elegí {stepSelections.length} de {step.selectionCount}
                </span>
              )}
            </div>

            {ungrouped.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {ungrouped.map((option) => {
                  const isSelected = stepSelections.includes(option.id);
                  return (
                    <OptionCard
                      key={option.id}
                      option={option}
                      isSelected={isSelected}
                      disabled={!isSelected && stepFull}
                      onSelect={() => selectOption(step, option.id)}
                      size="lg"
                    />
                  );
                })}
              </div>
            )}

            {named.map((group) => (
              <div key={group.id} className="mb-3">
                <p className="text-sm font-medium text-muted-foreground mb-1.5">
                  {group.name}
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {group.options.map((option) => {
                    const isSelected = stepSelections.includes(option.id);
                    return (
                      <OptionCard
                        key={option.id}
                        option={option}
                        isSelected={isSelected}
                        disabled={!isSelected && stepFull}
                        onSelect={() => selectOption(step, option.id)}
                        size="sm"
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {needsPaymentChoice && (
        <div>
          <h3 className="text-base font-semibold mb-2">Forma de pago</h3>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={cn(
                "rounded-lg border p-3 text-left transition-all",
                paymentMethod === "cash"
                  ? "border-primary ring-2 ring-primary/50"
                  : "border-border/50 hover:border-primary/50"
              )}
            >
              <p className="text-xs text-muted-foreground">Contado / transferencia</p>
              <p className="font-bold">{formatPrice(product.cashPrice)}</p>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("installments")}
              className={cn(
                "rounded-lg border p-3 text-left transition-all",
                paymentMethod === "installments"
                  ? "border-primary ring-2 ring-primary/50"
                  : "border-border/50 hover:border-primary/50"
              )}
            >
              <p className="text-xs text-muted-foreground">{product.installments} cuotas</p>
              <p className="font-bold">
                {formatPrice(product.basePrice / product.installments)}
                <span className="text-xs font-normal text-muted-foreground"> c/u</span>
              </p>
            </button>
          </div>
        </div>
      )}

      {needsShipping && (
        <div>
          <h3 className="text-base font-semibold mb-2">Zona de envío</h3>
          <select
            value={shippingZoneId}
            onChange={(e) => setShippingZoneId(e.target.value)}
            className="w-full max-w-md h-10 rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs dark:bg-input/30"
          >
            <option value="">Seleccioná tu zona</option>
            {shippingZones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
                {shippingVariantSelected
                  ? ` — ${formatPrice(computeShippingPrice(product, zone, selections))}`
                  : ""}
              </option>
            ))}
          </select>
          {shippingVariantStep && !shippingVariantSelected && (
            <p className="text-xs text-muted-foreground mt-1.5">
              Elegí primero &quot;{shippingVariantStep.name}&quot; arriba para ver el precio de
              envío.
            </p>
          )}
        </div>
      )}

      <div className="sticky bottom-4 rounded-xl border border-border/50 bg-background/95 backdrop-blur-md p-4 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{missingLabel}</p>
          <p className="text-xl font-bold text-primary">{formatPrice(finalPrice)}</p>
          {canQuote && (
            <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
              <p>Metegol: {formatPrice(metegolPrice)}</p>
              {needsShipping && <p>Envío: {formatPrice(shippingPrice)}</p>}
              {paymentLabel && <p>Pago: {paymentLabel}</p>}
            </div>
          )}
        </div>
        {canQuote ? (
          <Button asChild size="lg">
            <a href={buildWhatsappUrl(message, whatsappPhone)} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" />
              Agregar al carrito
            </a>
          </Button>
        ) : (
          <Button size="lg" disabled>
            <MessageCircle className="w-4 h-4 mr-2" />
            Agregar al carrito
          </Button>
        )}
      </div>
    </div>
  );
}
