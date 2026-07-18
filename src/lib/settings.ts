import "server-only";
import { getDb } from "@/lib/firebase-admin";

export interface ShippingZone {
  id: string;
  name: string;
  price: number;
}

export interface SiteSettings {
  whatsappPhone: string;
  shippingZones: ShippingZone[];
}

const COLLECTION = "settings";
const DOC_ID = "site";

const DEFAULT_SETTINGS: SiteSettings = {
  whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "",
  shippingZones: [],
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const doc = await getDb().collection(COLLECTION).doc(DOC_ID).get();
  if (!doc.exists) return DEFAULT_SETTINGS;
  const data = doc.data() as Partial<SiteSettings>;
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    shippingZones: data.shippingZones ?? DEFAULT_SETTINGS.shippingZones,
  };
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  await getDb().collection(COLLECTION).doc(DOC_ID).set(settings, { merge: true });
}
