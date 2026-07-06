const isSandbox = process.env.NAVE_ENV !== "production";

const AUTH_URL = isSandbox
  ? "https://homoservices.apinaranja.com/security-ms/api/security/auth0/b2b/m2msPrivate"
  : "https://services.apinaranja.com/security-ms/api/security/auth0/b2b/m2msPrivate";

const PAYMENT_URL = isSandbox
  ? "https://api-sandbox.ranty.io/api/payment_request/ecommerce"
  : "https://api.ranty.io/api/payment_request/ecommerce";

export const NAVE_CHECKOUT_BASE = isSandbox
  ? "https://sandbox-ecommerce.ranty.io/galicia/nave/checkout"
  : "https://ecommerce.ranty.io/galicia/nave/checkout";

async function getAccessToken(): Promise<string> {
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.NAVE_CLIENT_ID,
      client_secret: process.env.NAVE_CLIENT_SECRET,
      audience: "https://naranja.com/ranty/merchants/api",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`NAVE auth error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export interface CreatePaymentParams {
  externalPaymentId: string;
  amount: string;
  productName: string;
  productDescription?: string;
  callbackUrl: string;
}

export interface NavePaymentResponse {
  id: string;
  external_payment_id: string;
  checkout_url: string;
  qr_data: string;
}

export async function createPaymentIntent(
  params: CreatePaymentParams
): Promise<NavePaymentResponse> {
  const token = await getAccessToken();

  const res = await fetch(PAYMENT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      external_payment_id: params.externalPaymentId,
      seller: { pos_id: process.env.NAVE_POS_ID },
      transactions: [
        {
          amount: { currency: "ARS", value: params.amount },
          products: [
            {
              name: params.productName,
              description: params.productDescription ?? "",
              quantity: 1,
              unit_price: { currency: "ARS", value: params.amount },
            },
          ],
        },
      ],
      additional_info: { callback_url: params.callbackUrl },
      duration_time: 3600,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`NAVE payment error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}
