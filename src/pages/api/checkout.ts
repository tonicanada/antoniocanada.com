import type { APIRoute } from "astro";
import Stripe from "stripe";

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const POST: APIRoute = async ({ request, redirect }) => {
  const contentType = request.headers.get("content-type") || "";
  let asunto = "";
  let precioStr = "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const bodyText = await request.text();
    const params = new URLSearchParams(bodyText);
    asunto = params.get("asunto") ?? "";
    precioStr = params.get("precio") ?? "";
  } else {
    return new Response("Unsupported content type", { status: 400 });
  }

  console.log("asunto:", asunto);
  console.log("precioStr:", precioStr);

  if (!asunto || !precioStr) {
    return new Response("Parámetros inválidos", { status: 400 });
  }

  const precio = Number(precioStr);
  if (isNaN(precio) || precio <= 0) {
    return new Response("Precio no válido", { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: decodeURIComponent(asunto.replace(/_/g, " ")),
          },
          unit_amount: Math.round(precio * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `https://antoniocanada.com/gracias`,
    cancel_url: `https://antoniocanada.com/cancelado`,
  });

  return redirect(session.url!, 303);
};
