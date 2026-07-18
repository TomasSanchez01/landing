"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Product } from "@/lib/product-types";
import { cn } from "@/lib/utils";

export function Navbar({ products }: { products: Product[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center md:justify-between h-16">
          <Link href="/" className="shrink-0 w">
            <Image
              src="/logo.png"
              alt="Logo"
              width={200}
              height={100}
              className="h-4 md:h-6 w-auto"
              priority
              unoptimized
            />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {products
              .filter((product) => !product.comingSoon)
              .map((product) => {
                const isActive = pathname === `/producto/${product.slug}`;
                return (
                  <Link
                    key={product.id}
                    href={`/producto/${product.slug}`}
                    className={cn(
                      "px-4 h-10 flex items-center rounded-lg text-sm font-medium transition-all duration-200",
                      "hover:bg-secondary/50",
                      isActive && "bg-secondary text-primary"
                    )}
                  >
                    {product.name}
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </nav>
  );
}
