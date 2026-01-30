import Link from "next/link";
import Image from "next/image";
import { products } from "@/data/products";

export default function Home() {
  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
      <section className="container mx-auto px-4 pt-6 flex-1 flex flex-col">
        <div className="text-center mb-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2">
            Bienvenido a <span className="text-primary">CAPOCANNONIERE</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Explorá nuestra línea de productos. Hacé click en las solapas o en las imágenes para ver cada producto.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1 max-h-[calc(100vh-14rem)]">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/producto/${product.slug}`}
              className="group relative rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300"
            >
              <Image
                src={product.tabImage}
                alt={product.name}
                fill
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                <span className="text-sm font-medium">{product.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
