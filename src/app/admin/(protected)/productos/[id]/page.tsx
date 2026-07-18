import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import { ProductForm } from "../../product-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar {product.name}</h1>
      <ProductForm product={product} />
    </div>
  );
}
