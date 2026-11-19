import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

// La app de stock es un HTML autónomo (CSS + JS propios). Se sirve solo con sesión
// de admin y se embebe en /admin/stock con un iframe para que sus estilos no choquen
// con los del panel. Los datos los lee/escribe vía /api/admin/stock.
// El archivo se incluye en el deploy vía outputFileTracingIncludes (next.config.ts).
const HTML_PATH = path.join(process.cwd(), "src/app/admin/stock-app/stock.html");
let cached: string | null = null;

export async function GET(request: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (!cached || process.env.NODE_ENV !== "production") {
    cached = await readFile(HTML_PATH, "utf8");
  }

  return new NextResponse(cached, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
