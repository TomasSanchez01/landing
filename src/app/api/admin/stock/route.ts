import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { applyStockOps, getStockState, getStockSummary, isStockProduct, parseOps } from "@/lib/stock";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    if (searchParams.get("summary")) {
      return NextResponse.json({ fab: await getStockSummary() }, { headers: noStore });
    }

    const p = searchParams.get("p");
    if (!isStockProduct(p)) {
      return NextResponse.json({ error: "Producto inválido" }, { status: 400 });
    }
    return NextResponse.json(await getStockState(p), { headers: noStore });
  } catch (err) {
    console.error("[admin/stock] error leyendo:", err);
    return NextResponse.json({ error: "No se pudo leer el stock" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { p?: unknown; ops?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!isStockProduct(body.p)) {
    return NextResponse.json({ error: "Producto inválido" }, { status: 400 });
  }

  let ops;
  try {
    ops = parseOps(body.ops);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "ops inválidas" }, { status: 400 });
  }

  try {
    const ids = await applyStockOps(body.p, ops);
    return NextResponse.json({ ok: true, ids });
  } catch (err) {
    console.error("[admin/stock] error guardando:", err);
    return NextResponse.json({ error: "No se pudo guardar" }, { status: 500 });
  }
}
