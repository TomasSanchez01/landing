import "server-only";
import { getDb } from "@/lib/firebase-admin";

export interface SiteSettings {
  whatsappPhone: string;
  whatsappConsultasPhone: string;
  manualUsuarioEnabled: boolean;
}

const COLLECTION = "settings";
const DOC_ID = "site";

const DEFAULT_SETTINGS: SiteSettings = {
  whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "",
  whatsappConsultasPhone: "",
  manualUsuarioEnabled: true,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const doc = await getDb().collection(COLLECTION).doc(DOC_ID).get();
  if (!doc.exists) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(doc.data() as Partial<SiteSettings>) };
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  await getDb().collection(COLLECTION).doc(DOC_ID).set(settings, { merge: true });
}
