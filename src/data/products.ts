export interface Product {
  id: string;
  name: string;
  slug: string;
  tabImage: string;
  description: string;
  longDescription: string;
  features: string[];
  images: string[];
  videos: string[];
  price: string;
  storeUrl: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Producto 1",
    slug: "producto-1",
    tabImage: "/tabs/capo1.png",
    description: "Descripción corta del producto 1",
    longDescription: "Descripción detallada del producto 1. Aquí va toda la información extendida sobre las características, materiales, uso recomendado y todo lo que el cliente necesita saber.",
    features: [
      "Característica principal 1",
      "Característica principal 2",
      "Característica principal 3",
    ],
    images: [
      "/products/producto-1/img-1.jpg",
      "/products/producto-1/img-2.jpg",
      "/products/producto-1/img-3.jpg",
    ],
    videos: ["/products/producto-1/video-1.mp4"],
    price: "$299",
    storeUrl: "https://tiendanube.com/producto-1",
  },
  {
    id: "2",
    name: "Producto 2",
    slug: "producto-2",
    tabImage: "/tabs/capo2.png",
    description: "Descripción corta del producto 2",
    longDescription: "Descripción detallada del producto 2. Aquí va toda la información extendida sobre las características, materiales, uso recomendado y todo lo que el cliente necesita saber.",
    features: [
      "Característica principal 1",
      "Característica principal 2",
      "Característica principal 3",
    ],
    images: [
      "/products/producto-2/img-1.jpg",
      "/products/producto-2/img-2.jpg",
      "/products/producto-2/img-3.jpg",
    ],
    videos: ["/products/producto-2/video-1.mp4"],
    price: "$399",
    storeUrl: "https://tiendanube.com/producto-2",
  },
  {
    id: "3",
    name: "Producto 3",
    slug: "producto-3",
    tabImage: "/tabs/capofinger.png",
    description: "Descripción corta del producto 3",
    longDescription: "Descripción detallada del producto 3. Aquí va toda la información extendida sobre las características, materiales, uso recomendado y todo lo que el cliente necesita saber.",
    features: [
      "Característica principal 1",
      "Característica principal 2",
      "Característica principal 3",
    ],
    images: [
      "/products/producto-3/img-1.jpg",
      "/products/producto-3/img-2.jpg",
      "/products/producto-3/img-3.jpg",
    ],
    videos: ["/products/producto-3/video-1.mp4"],
    price: "$499",
    storeUrl: "https://tiendanube.com/producto-3",
  },
  {
    id: "4",
    name: "Producto 4",
    slug: "producto-4",
    tabImage: "/tabs/minicapo.png",
    description: "Descripción corta del producto 4",
    longDescription: "Descripción detallada del producto 4. Aquí va toda la información extendida sobre las características, materiales, uso recomendado y todo lo que el cliente necesita saber.",
    features: [
      "Característica principal 1",
      "Característica principal 2",
      "Característica principal 3",
    ],
    images: [
      "/products/producto-4/img-1.jpg",
      "/products/producto-4/img-2.jpg",
      "/products/producto-4/img-3.jpg",
    ],
    videos: ["/products/producto-4/video-1.mp4"],
    price: "$599",
    storeUrl: "https://tiendanube.com/producto-4",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
