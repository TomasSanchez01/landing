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
