"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Media = { type: "image" | "video"; src: string };

export function ProductGallery({
  images,
  videos,
  productName,
}: {
  images: string[];
  videos: string[];
  productName: string;
}) {
  const media: Media[] = [
    ...images.map((src): Media => ({ type: "image", src })),
    ...videos.map((src): Media => ({ type: "video", src })),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (media.length === 0) return null;

  const active = media[activeIndex];

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="aspect-4/3 relative rounded-xl overflow-hidden border border-border/50 bg-secondary/20 block w-full cursor-zoom-in"
      >
        {active.type === "image" ? (
          <Image
            src={active.src}
            alt={productName}
            fill
            className="object-contain p-4"
            priority
          />
        ) : (
          <video src={active.src} className="w-full h-full object-contain" muted playsInline />
        )}
        {active.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black/60 p-3">
              <Play className="w-6 h-6 text-white" fill="white" />
            </div>
          </div>
        )}
      </button>

      {media.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {media.map((item, index) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "aspect-square relative rounded-md overflow-hidden border bg-secondary/20",
                index === activeIndex
                  ? "border-primary ring-2 ring-primary/50"
                  : "border-border/50 hover:border-primary/50"
              )}
            >
              {item.type === "image" ? (
                <Image
                  src={item.src}
                  alt={`${productName} - ${index + 1}`}
                  fill
                  className="object-contain p-2"
                  sizes="120px"
                />
              ) : (
                <>
                  <video src={item.src} className="w-full h-full object-contain" muted playsInline />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-4 h-4 text-white" fill="white" />
                  </div>
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 p-2 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="relative w-full max-w-4xl aspect-4/3">
            {active.type === "image" ? (
              <Image
                src={active.src}
                alt={productName}
                fill
                className="object-contain"
                sizes="100vw"
              />
            ) : (
              <video
                src={active.src}
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
