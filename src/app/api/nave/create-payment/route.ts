import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent } from "@/lib/nave";

export async function POST(request: NextRequest) {
  try {
    const { productName, description, amount, externalPaymentId } =
      await request.json();

    if (!productName || !amount || !externalPaymentId) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin;

    const payment = await createPaymentIntent({
      externalPaymentId,
      amount,
      productName,
      productDescription: description,
      callbackUrl: `${baseUrl}/pago/exito?order=${externalPaymentId}`,
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("[NAVE] create-payment error:", error);
    return NextResponse.json(
      { error: "Error al crear la intención de pago" },
      { status: 500 }
    );
  }
}
