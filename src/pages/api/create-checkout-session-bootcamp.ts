// src/pages/api/create-checkout-session-bootcamp.ts
export const prerender = false;

import type { APIRoute } from "astro";
import Stripe from "stripe";

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const POST: APIRoute = async () => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 5000, // USD 50 × 100
            product_data: {
              name: "Bootcamp ERPNext — Nov 2025",
              tax_code: "txcd_10103001",
            },
          },
          quantity: 1,
        },
      ],
      automatic_tax: { enabled: true },
      success_url: `${import.meta.env.PUBLIC_BASE_URL}/success/bootcamp-erpnext-2025`,
      cancel_url: `${import.meta.env.PUBLIC_BASE_URL}/cancelado`,
      metadata: { cohort: "bootcamp-nov-2025" },
    });

    return new Response(
      `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="refresh" content="0; URL='${session.url}'" />
          <title>Redirigiendo a Stripe...</title>
        </head>
        <body>
          <p>Redirigiendo a Stripe, por favor espera...</p>
        </body>
      </html>
    `,
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("❌ Error creando sesión de Stripe:", error);
    return new Response("Error al crear la sesión de Stripe", { status: 500 });
  }
};
