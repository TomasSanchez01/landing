// Crea el único usuario admin en Firebase Auth.
// Uso: yarn create-admin  (requiere FIREBASE_ADMIN_* y ADMIN_EMAIL/ADMIN_PASSWORD en .env.local)
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Falta ADMIN_EMAIL o ADMIN_PASSWORD en .env.local");
  process.exit(1);
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const auth = getAuth(app);

try {
  const existing = await auth.getUserByEmail(email).catch(() => null);

  if (existing) {
    await auth.updateUser(existing.uid, { password });
    console.log(`✔ Usuario ya existía, contraseña actualizada: ${email}`);
  } else {
    const user = await auth.createUser({ email, password, emailVerified: true });
    console.log(`✔ Usuario admin creado: ${user.email} (${user.uid})`);
  }
} catch (err) {
  console.error("Error creando el usuario admin:", err.message);
  process.exit(1);
}

process.exit(0);
