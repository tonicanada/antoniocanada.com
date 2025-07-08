import type { APIRoute } from "astro";
import Stripe from "stripe";

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15", // o la que tengas en tu cuenta
});

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const asunto = formData.get("asunto")?.toString();
  const precio = Number(formData.get("precio"));

  if (!asunto || !precio) {
    return new Response("Faltan campos obligatorios", { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: precio * 100,
            product_data: {
              name: asunto.replace(/_/g, " "),
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${import.meta.env.PUBLIC_BASE_URL}/gracias`,
      cancel_url: `${import.meta.env.PUBLIC_BASE_URL}/cancelado`,
    });

    // ✅ En lugar de redirigir, mostramos la URL devuelta
    return new Response(`URL generada por Stripe: ${session.url}`, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });

  } catch (error) {
    console.error(error);
    return new Response("Error al crear la sesión de Stripe", { status: 500 });
  }
};
