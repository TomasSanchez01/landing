// Carga los 4 productos actuales en Firestore como punto de partida.
// Uso: yarn seed  (requiere las variables FIREBASE_ADMIN_* en .env.local)
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore(app);

const products = [
  {
    slug: "producto-1",
    name: "Producto 1",
    tabImage: "/tabs/capo1.png",
    description: "Descripción corta del producto 1",
    longDescription:
      "Descripción detallada del producto 1. Aquí va toda la información extendida sobre las características, materiales, uso recomendado y todo lo que el cliente necesita saber.",
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
    basePrice: 299,
    discountPercent: 0,
    published: false,
    order: 0,
    steps: [],
  },
  {
    slug: "producto-2",
    name: "Producto 2",
    tabImage: "/tabs/capo2.png",
    description: "Descripción corta del producto 2",
    longDescription:
      "Descripción detallada del producto 2. Aquí va toda la información extendida sobre las características, materiales, uso recomendado y todo lo que el cliente necesita saber.",
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
    basePrice: 399,
    discountPercent: 0,
    published: false,
    order: 1,
    steps: [],
  },
  {
    slug: "producto-3",
    name: "Producto 3",
    tabImage: "/tabs/capofinger.png",
    description: "Descripción corta del producto 3",
    longDescription:
      "Descripción detallada del producto 3. Aquí va toda la información extendida sobre las características, materiales, uso recomendado y todo lo que el cliente necesita saber.",
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
    basePrice: 499,
    discountPercent: 0,
    published: false,
    order: 2,
    steps: [],
  },
  {
    slug: "producto-4",
    name: "Producto 4",
    tabImage: "/tabs/minicapo.png",
    description: "Descripción corta del producto 4",
    longDescription:
      "Descripción detallada del producto 4. Aquí va toda la información extendida sobre las características, materiales, uso recomendado y todo lo que el cliente necesita saber.",
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
    basePrice: 599,
    discountPercent: 0,
    published: false,
    order: 3,
    steps: [],
  },
];

for (const product of products) {
  const docRef = db.collection("products").doc();
  const now = Date.now();
  await docRef.set({ ...product, id: docRef.id, createdAt: now, updatedAt: now });
  console.log(`✔ ${product.name} (${docRef.id})`);
}

console.log(
  "\nListo. Los productos quedaron como borrador (published: false) con las imágenes " +
    "viejas de /public como placeholder — subí las reales y publicalos desde /admin."
);
process.exit(0);
