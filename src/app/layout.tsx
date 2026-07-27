import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { WhatsappButton } from "@/components/whatsapp-button";
import { getPublishedProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/settings";
import { resolveConsultasPhone } from "@/lib/whatsapp";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mi Marca | Productos",
  description: "Descubrí nuestra línea de productos premium.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [products, settings] = await Promise.all([getPublishedProducts(), getSiteSettings()]);
  const consultasPhone = resolveConsultasPhone(settings);

  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <Navbar products={products} />
        <main className="pt-16">{children}</main>
        <WhatsappButton phone={consultasPhone} />
      </body>
    </html>
  );
}
