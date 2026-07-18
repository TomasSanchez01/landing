"use client";

export async function uploadAdminFile(file: File, pathPrefix: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("pathPrefix", pathPrefix);

  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || "Error al subir el archivo");
  }

  const { url } = await res.json();
  return url as string;
}

export async function deleteAdminFile(url: string): Promise<void> {
  await fetch("/api/admin/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}
