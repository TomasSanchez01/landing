import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { products, getProductBySlug } from "@/data/products";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronLeft, Check } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  return {
    title: `${product.name} | Mi Marca`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square relative rounded-xl overflow-hidden border border-border/50 bg-secondary/20">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain p-8"
                priority
              />
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {product.images.slice(1).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square relative rounded-lg overflow-hidden border border-border/50 bg-secondary/20"
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - imagen ${index + 2}`}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {product.name}
              </h1>
              <p className="text-2xl text-primary font-semibold">
                {product.price}
              </p>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.longDescription}
            </p>

            <div>
              <h2 className="text-lg font-semibold mb-3">Características</h2>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-muted-foreground"
                  >
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Button size="lg" className="w-full sm:w-auto" asChild>
              <a
                href={product.storeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Comprar en Tienda
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>

        {product.videos.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Videos</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {product.videos.map((video, index) => (
                <div
                  key={index}
                  className="aspect-video relative rounded-xl overflow-hidden border border-border/50 bg-secondary/20"
                >
                  <video
                    src={video}
                    controls
                    className="w-full h-full object-cover"
                    poster={product.images[0]}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
