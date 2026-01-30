"use client";

import { useState } from "react";
import Image from "next/image";

interface PlaceholderImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function PlaceholderImage({
  src,
  alt,
  fill,
  width,
  height,
  className = "",
  sizes,
  priority,
}: PlaceholderImageProps) {
  const [error, setError] = useState(false);

  const placeholderSrc = `https://placehold.co/${width || 600}x${height || 400}/1a1a2e/4a9eff?text=${encodeURIComponent(alt.slice(0, 15))}`;

  if (fill) {
    return (
      <Image
        src={error ? placeholderSrc : src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <Image
      src={error ? placeholderSrc : src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
