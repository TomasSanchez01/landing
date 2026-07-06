import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function PagoExitoPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">¡Pago exitoso!</h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Gracias por tu compra. Recibirás un email de confirmación a la
            brevedad.
          </p>
        </div>
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
