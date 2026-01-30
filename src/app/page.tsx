import Link from "next/link";
import Image from "next/image";
import { products } from "@/data/products";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Bienvenido a <span className="text-primary">CAPOCANNONIERE</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explorá nuestra línea de productos. Hacé click en las solapas de arriba
            o en las imágenes de abajo para ver cada producto en detalle.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/producto/${product.slug}`}
              className="group relative aspect-square rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300"
            >
              <Image
                src={product.tabImage}
                alt={product.name}
                fill
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                <span className="text-sm font-medium">{product.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
