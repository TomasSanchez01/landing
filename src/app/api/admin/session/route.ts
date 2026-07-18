import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_EXPIRES_IN_MS,
  checkCredentials,
  createSessionToken,
} from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Faltan email y contraseña" }, { status: 400 });
  }

  try {
    if (!checkCredentials(email, password)) {
      return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
    });
    return response;
  } catch (err) {
    console.error("[admin/session] error creando la sesión:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "No se pudo crear la sesión", detail: message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
