// src/stripe.ts
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error("Falta STRIPE_SECRET_KEY en variables de entorno");
}

// OJO: no ponemos apiVersion para evitar errores de tipos;
// Stripe usa la versión asociada al SDK que instalaste.
export const stripe = new Stripe(secretKey, {} as Stripe.StripeConfig);
