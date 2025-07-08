import type { APIRoute } from "astro";
import Stripe from "stripe";

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY!);

export const POST = async ({ request }) => {
  const formData = await request.formData();
  const asunto = formData.get("asunto");
  const precio = formData.get("precio");

  console.log("asunto:", asunto);
  console.log("precio:", precio);

  return new Response(
    `Recibido: asunto=${asunto}, precio=${precio}`,
    { status: 200 }
  );
};
