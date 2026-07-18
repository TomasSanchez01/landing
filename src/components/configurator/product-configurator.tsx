"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, MessageCircle } from "lucide-react";
import type { ConfigOption, ConfigStep, Product } from "@/lib/product-types";
import { computeFinalPrice } from "@/lib/product-types";
import { buildWhatsappMessage, buildWhatsappUrl } from "@/lib/whatsapp";

function formatPrice(value: number) {
  return value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}

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
        "text-left rounded-lg border overflow-hidden transition-all shrink-0 w-20",
        isSelected
          ? "border-primary ring-2 ring-primary/50"
          : "border-border/50 hover:border-primary/50"
      )}
    >
      <div className="aspect-square relative bg-secondary/20">
        {option.images[0] && (
          <Image
            src={option.images[0]}
            alt={option.label}
            fill
            className="object-contain p-1.5"
            sizes="80px"
          />
        )}
        {isSelected && (
          <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
            <Check className="w-2.5 h-2.5" />
          </div>
        )}
      </div>
      <div className="px-1.5 py-1">
        <p className="font-medium text-[10px] leading-tight line-clamp-2">{option.label}</p>
        {option.priceModifier !== 0 && (
          <p className="text-[9px] text-muted-foreground">
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
        const { ungrouped, named } = groupOptions(step);

        return (
          <div key={step.id}>
            <h3 className="text-base font-semibold mb-2">{step.name}</h3>

            {ungrouped.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
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

            {named.map((group) => (
              <div key={group.id} className="mb-3">
                <p className="text-sm font-medium text-muted-foreground mb-1.5">
                  {group.name}
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {group.options.map((option) => (
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
