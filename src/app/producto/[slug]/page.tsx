import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublishedProducts, getProductBySlug } from "@/lib/products";
import { ProductConfigurator } from "@/components/configurator/product-configurator";
import { ProductGallery } from "@/components/product-gallery";
import { PriceCard } from "@/components/price-card";
import { ChevronLeft, Check } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getPublishedProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  return {
    title: `${product.name} | Capocannoniere`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.published) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <ProductGallery
            images={product.images}
            videos={product.videos}
            productName={product.name}
          />

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>

            <PriceCard
              basePrice={product.basePrice}
              discountPercent={product.discountPercent}
              installments={product.installments}
            />

            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.longDescription}
            </p>

            {product.features.length > 0 && (
              <ul className="space-y-1.5">
                {product.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <section>
          <h2 className="text-xl font-bold mb-4">Armá tu metegol</h2>
          <ProductConfigurator product={product} />
        </section>
      </div>
    </div>
  );
}
