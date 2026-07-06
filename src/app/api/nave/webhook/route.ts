import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // body: { payment_id, payment_check_url, external_payment_id }
    console.log("[NAVE] Webhook received:", JSON.stringify(body, null, 2));

    // TODO: fetch payment status from body.payment_check_url and update your DB
    // Example:
    // const token = await getAccessToken();
    // const payment = await fetch(body.payment_check_url, {
    //   headers: { Authorization: `Bearer ${token}` },
    // }).then(r => r.json());
    // await updateOrderStatus(body.external_payment_id, payment.status.name);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[NAVE] Webhook error:", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
