"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { clientStorage } from "@/lib/firebase-client";
import { Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  pathPrefix: string;
  multiple?: boolean;
  accept?: string;
  label?: string;
  kind?: "image" | "video";
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(url);
}

export function ImageUploader({
  value,
  onChange,
  pathPrefix,
  multiple = true,
  accept = "image/*",
  label = "Subir imagen",
  kind = "image",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");

    try {
      const uploads = await Promise.all(
        Array.from(files).map(async (file) => {
          const path = `${pathPrefix}/${Date.now()}-${file.name}`;
          const storageRef = ref(clientStorage, path);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        })
      );

      onChange(multiple ? [...value, ...uploads] : uploads);
    } catch {
      setError("Error al subir. Revisá tu conexión e intentá de nuevo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async (url: string) => {
    onChange(value.filter((u) => u !== url));
    try {
      await deleteObject(ref(clientStorage, url));
    } catch {
      // el archivo puede no existir más en Storage; no bloquea el flujo
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        {value.map((url) => (
          <div
            key={url}
            className="relative w-24 h-24 rounded-lg overflow-hidden border border-border/50 bg-secondary/20 group"
          >
            {kind === "video" || isVideoUrl(url) ? (
              <video src={url} className="w-full h-full object-contain" muted playsInline />
            ) : (
              <Image src={url} alt="" fill className="object-contain p-1" sizes="96px" />
            )}
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute top-1 right-1 rounded-full bg-black/60 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Eliminar"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "w-24 h-24 rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors",
            uploading && "opacity-50 pointer-events-none"
          )}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          <span className="text-[10px] text-center px-1">{label}</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
