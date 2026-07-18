import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-session";
import { getBucket } from "@/lib/firebase-admin";
import { UPLOAD_LIMITS } from "@/lib/upload-limits";

export async function POST(request: NextRequest) {
  const isAuthenticated = await getAdminSession();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const pathPrefix = formData.get("pathPrefix");

    if (!(file instanceof File) || typeof pathPrefix !== "string" || !pathPrefix) {
      return NextResponse.json({ error: "Falta el archivo o el pathPrefix" }, { status: 400 });
    }

    const limits = file.type.startsWith("video/") ? UPLOAD_LIMITS.video : UPLOAD_LIMITS.image;
    if (file.size > limits.maxMB * 1024 * 1024) {
      return NextResponse.json(
        { error: `El archivo supera el máximo permitido de ${limits.maxMB} MB.` },
        { status: 400 }
      );
    }

    const bucket = getBucket();
    const objectPath = `${pathPrefix}/${Date.now()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await bucket.file(objectPath).save(buffer, {
      contentType: file.type || "application/octet-stream",
      resumable: false,
    });

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[admin/upload] error subiendo archivo:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "No se pudo subir el archivo", detail: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const isAuthenticated = await getAdminSession();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { url } = await request.json();
    if (typeof url !== "string") {
      return NextResponse.json({ error: "Falta url" }, { status: 400 });
    }

    const match = url.match(/\/o\/([^?]+)/);
    if (!match) {
      return NextResponse.json({ ok: true });
    }

    const objectPath = decodeURIComponent(match[1]);
    await getBucket().file(objectPath).delete({ ignoreNotFound: true });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/upload] error borrando archivo:", err);
    return NextResponse.json({ ok: true });
  }
}
