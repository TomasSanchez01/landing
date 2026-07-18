import Link from "next/link";
import Image from "next/image";
import { getPublishedProducts } from "@/lib/products";
import { cn } from "@/lib/utils";

export default async function Home() {
  const products = await getPublishedProducts();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Explorá nuestra línea de productos. Pasá el mouse sobre cada tarjeta para verla.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const cardClass = cn(
            "group relative aspect-2/3 rounded-xl overflow-hidden border border-border/50 bg-secondary/20 transition-all duration-300",
            product.comingSoon ? "cursor-not-allowed" : "hover:border-primary/50"
          );

          const inner = (
            <>
              <Image
                src={product.navbarImage}
                alt={product.name}
                fill
                className="object-contain p-6 transition-opacity duration-300 group-hover:opacity-0"
              />
              <Image
                src={product.tabImage}
                alt={product.name}
                fill
                className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              {product.comingSoon && (
                <span className="absolute top-2 right-2 z-20 rounded-full bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                  Próximamente
                </span>
              )}
            </>
          );

          if (product.comingSoon) {
            return (
              <div key={product.id} className={cardClass}>
                {inner}
              </div>
            );
          }

          return (
            <Link key={product.id} href={`/producto/${product.slug}`} className={cardClass}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
