import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { SESSION_COOKIE_NAME, SESSION_EXPIRES_IN_MS } from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  if (!idToken || typeof idToken !== "string") {
    return NextResponse.json({ error: "Falta idToken" }, { status: 400 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    if (!decoded.email) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
    });
    return response;
  } catch (err) {
    console.error("[admin/session] error creando la sesión:", err);
    const message = err instanceof Error ? err.message : "error desconocido";
    return NextResponse.json({ error: "No se pudo crear la sesión", detail: message }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
