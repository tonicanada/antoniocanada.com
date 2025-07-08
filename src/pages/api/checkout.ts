export const prerender = false;

import type { APIRoute } from "astro";
import Stripe from "stripe";

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  const asunto = formData.get("asunto")?.toString();
  const precioRaw = formData.get("precio")?.toString();
  const emailRaw = formData.get("email");

  const precio = precioRaw ? Number(precioRaw) : NaN;
  const email = emailRaw && typeof emailRaw === "string" ? emailRaw : undefined;

  console.log("➡️ FormData recibido:", { asunto, precio, email });

  if (!asunto || !precio || isNaN(precio)) {
    return new Response("Faltan campos obligatorios o precio inválido", { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(precio * 100),
            product_data: {
              name: asunto.replace(/_/g, " "),
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${import.meta.env.PUBLIC_BASE_URL}/gracias`,
      cancel_url: `${import.meta.env.PUBLIC_BASE_URL}/cancelado`,
      ...(email && { customer_email: email }),
    });

    console.log("✅ Sesión de Stripe creada:", session.url);

    return new Response(`
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
    `, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });

  } catch (error) {
    console.error("❌ Error creando sesión de Stripe:", error);
    return new Response("Error al crear la sesión de Stripe", { status: 500 });
  }
};
