import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // firebase-admin (via jose/jwks-rsa) mezcla ESM/CJS de una forma que el
  // bundler de Next no resuelve bien; lo dejamos afuera del bundle para que
  // se cargue nativo en runtime (evita el crash ERR_REQUIRE_ESM en Vercel).
  serverExternalPackages: ["firebase-admin"],
  images: {
    // Vercel Hobby limita la cantidad de "source images" que se pueden
    // optimizar por mes; cada imagen del admin se sube con un nombre nuevo
    // (timestamp), así que esa cuota se agota rápido y devuelve 402 para
    // las imágenes que todavía no tienen una versión optimizada cacheada.
    // Firebase Storage ya sirve los archivos directo y livianos, así que
    // desactivamos el optimizador de Next para no depender de esa cuota.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
