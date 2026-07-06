"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const NAVE_CHECKOUT_BASE =
  process.env.NEXT_PUBLIC_NAVE_ENV === "production"
    ? "https://ecommerce.ranty.io/galicia/nave/checkout"
    : "https://sandbox-ecommerce.ranty.io/galicia/nave/checkout";


interface Props {
  productId: string;
  productName: string;
  description: string;
  amount: string;
}

interface CheckoutData {
  id: string;
  checkout_url: string;
  qr_data: string;
}

type Status = "idle" | "loading" | "open" | "success" | "rejected" | "expired" | "error";

export function NaveCheckoutButton({ productId, productName, description, amount }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [checkout, setCheckout] = useState<CheckoutData | null>(null);

  useEffect(() => {
    if (status !== "open") return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type !== "PAYMENT_MODAL_RESPONSE") return;
      const { success, closeModal, expiration, rejected } = event.data.data ?? {};

      if (closeModal) {
        closeModal_();
      } else if (success) {
        setCheckout(null);
        setStatus("success");
      } else if (expiration) {
        setCheckout(null);
        setStatus("expired");
      } else if (rejected) {
        setCheckout(null);
        setStatus("rejected");
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [status]);

  const closeModal_ = () => {
    setCheckout(null);
    setStatus("idle");
  };

  const handlePay = async () => {
    setStatus("loading");
    try {
      const externalPaymentId = `${productId}-${Date.now()}`.slice(0, 36);
      const res = await fetch("/api/nave/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, description, amount, externalPaymentId }),
      });

      if (!res.ok) throw new Error("payment creation failed");

      const data: CheckoutData = await res.json();
      setCheckout(data);
      setStatus("open");
    } catch {
      setStatus("error");
    }
  };

  const iframeSrc = checkout
    ? `${NAVE_CHECKOUT_BASE}?payment_request_id=${checkout.id}&qr_data=${encodeURIComponent(checkout.qr_data)}`
    : "";

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-green-600">
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">¡Pago aprobado! Gracias por tu compra.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        variant="outline"
        className="w-full sm:w-auto border-sky-400 text-sky-500 hover:bg-sky-50 hover:text-sky-600"
        onClick={handlePay}
        disabled={status === "loading" || status === "open"}
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Iniciando pago...
          </>
        ) : (
          "Pagar con NAVE"
        )}
      </Button>

      {status === "error" && (
        <p className="text-sm text-destructive flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          Error al iniciar el pago. Intentá de nuevo.
        </p>
      )}
      {status === "rejected" && (
        <p className="text-sm text-destructive flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          Pago rechazado. Intentá con otra tarjeta.
        </p>
      )}
      {status === "expired" && (
        <p className="text-sm text-amber-600 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          La sesión de pago expiró. Intentá de nuevo.
        </p>
      )}

      {status === "open" && checkout && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal_()}
        >
          <div className="relative bg-white rounded-2xl overflow-hidden w-full max-w-[440px] shadow-2xl">
            <button
              onClick={closeModal_}
              className="absolute top-3 right-3 z-10 rounded-full bg-gray-100 hover:bg-gray-200 p-1.5 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
            <iframe
              src={iframeSrc}
              className="w-full h-[620px]"
              title="Checkout NAVE"
              allow="payment"
            />
          </div>
        </div>
      )}
    </div>
  );
}
