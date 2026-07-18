import { formatPrice } from "@/lib/format";

interface PriceCardProps {
  basePrice: number;
  discountPercent: number;
  installments: number;
}

export function PriceCard({ basePrice, discountPercent, installments }: PriceCardProps) {
  const cashPrice = basePrice * (1 - discountPercent / 100);
  const hasInstallments = installments > 1;
  const installmentAmount = basePrice / installments;

  return (
    <div className="rounded-xl bg-neutral-950 text-white overflow-hidden">
      {hasInstallments ? (
        <div className="grid grid-cols-2 divide-x divide-white/15">
          <div className="p-4 space-y-1">
            <p className="text-xs font-bold tracking-widest text-sky-400 uppercase underline decoration-2 underline-offset-4">
              Cuotas
            </p>
            <p className="text-lg sm:text-xl font-extrabold uppercase tracking-tight leading-none">
              {installments} cuotas de{" "}
              <span className="text-2xl sm:text-3xl">{formatPrice(installmentAmount)}</span>
            </p>
            <p className="text-xs text-white/60 uppercase tracking-wide">
              Precio final: {formatPrice(basePrice)}
            </p>
          </div>
          <div className="p-4 space-y-1">
            <p className="text-xs font-bold tracking-widest text-white/70 uppercase">
              Contado / transferencia
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {formatPrice(cashPrice)}
            </p>
            {discountPercent > 0 && (
              <p className="text-xs text-white/60">
                <span className="line-through">{formatPrice(basePrice)}</span>{" "}
                <span className="text-sky-400 font-semibold">-{discountPercent}%</span>
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-white/70 uppercase">Precio</p>
            <p className="text-3xl font-extrabold tracking-tight">{formatPrice(cashPrice)}</p>
          </div>
          {discountPercent > 0 && (
            <p className="text-sm text-white/60 mb-1">
              <span className="line-through">{formatPrice(basePrice)}</span>{" "}
              <span className="text-sky-400 font-semibold">-{discountPercent}%</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
