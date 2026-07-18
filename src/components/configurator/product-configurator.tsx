"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, MessageCircle } from "lucide-react";
import type { ConfigOption, Product } from "@/lib/product-types";
import { computeFinalPrice } from "@/lib/product-types";
import { buildWhatsappMessage, buildWhatsappUrl } from "@/lib/whatsapp";

function formatPrice(value: number) {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

function groupOptions(options: ConfigOption[]): Map<string, ConfigOption[]> {
  const groups = new Map<string, ConfigOption[]>();
  for (const option of options) {
    const key = option.group?.trim() || "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(option);
  }
  return groups;
}

function OptionCard({
  option,
  isSelected,
  onSelect,
}: {
  option: ConfigOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "text-left rounded-lg border overflow-hidden transition-all",
        isSelected
          ? "border-primary ring-2 ring-primary/50"
          : "border-border/50 hover:border-primary/50"
      )}
    >
      <div className="aspect-4/3 relative bg-secondary/20">
        {option.images[0] && (
          <Image
            src={option.images[0]}
            alt={option.label}
            fill
            className="object-contain p-2"
            sizes="200px"
          />
        )}
        {isSelected && (
          <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
            <Check className="w-3 h-3" />
          </div>
        )}
      </div>
      <div className="px-2 py-1.5">
        <p className="font-medium text-xs leading-tight">{option.label}</p>
        {option.priceModifier !== 0 && (
          <p className="text-[11px] text-muted-foreground">
            {option.priceModifier > 0 ? "+" : ""}
            {formatPrice(option.priceModifier)}
          </p>
        )}
      </div>
    </button>
  );
}

export function ProductConfigurator({ product }: { product: Product }) {
  const [selections, setSelections] = useState<Record<string, string>>({});

  const message = buildWhatsappMessage(product, selections);

  if (product.steps.length === 0) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-border/50 bg-secondary/20 p-4">
        <div>
          <p className="font-medium">{formatPrice(product.basePrice)}</p>
          <p className="text-sm text-muted-foreground">
            Consultanos por este producto y te cotizamos al instante.
          </p>
        </div>
        <Button asChild>
          <a href={buildWhatsappUrl(message)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4 mr-2" />
            Consultar por WhatsApp
          </a>
        </Button>
      </div>
    );
  }

  const selectOption = (stepId: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [stepId]: optionId }));
  };

  const selectedCount = product.steps.filter((s) => selections[s.id]).length;
  const allSelected = selectedCount === product.steps.length;
  const finalPrice = computeFinalPrice(product, selections);

  return (
    <div className="space-y-6 pb-24">
      {product.steps.map((step) => {
        const groups = groupOptions(step.options);
        const ungrouped = groups.get("") ?? [];
        const named = [...groups.entries()].filter(([key]) => key !== "");

        return (
          <div key={step.id}>
            <h3 className="text-base font-semibold mb-2">{step.name}</h3>

            {ungrouped.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mb-3">
                {ungrouped.map((option) => (
                  <OptionCard
                    key={option.id}
                    option={option}
                    isSelected={selections[step.id] === option.id}
                    onSelect={() => selectOption(step.id, option.id)}
                  />
                ))}
              </div>
            )}

            {named.map(([groupName, options]) => (
              <div key={groupName} className="mb-3">
                <p className="text-sm font-medium text-muted-foreground mb-1.5">
                  {groupName}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {options.map((option) => (
                    <OptionCard
                      key={option.id}
                      option={option}
                      isSelected={selections[step.id] === option.id}
                      onSelect={() => selectOption(step.id, option.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <div className="sticky bottom-4 rounded-xl border border-border/50 bg-background/95 backdrop-blur-md p-4 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {allSelected
              ? `${selectedCount} de ${product.steps.length} características elegidas`
              : `Faltan ${product.steps.length - selectedCount} característica(s) por elegir`}
          </p>
          <p className="text-xl font-bold text-primary">{formatPrice(finalPrice)}</p>
        </div>
        {allSelected ? (
          <Button asChild size="lg">
            <a href={buildWhatsappUrl(message)} target="_blank" rel="noopener noreferrer">
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
