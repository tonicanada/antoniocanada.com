export const prerender = false;

import type { APIRoute } from "astro";
import Stripe from "stripe";

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

type CheckoutProduct = {
  amountEur: number;
  name: string;
  taxCode?: string;
};

const PRODUCT_CATALOG: Record<string, CheckoutProduct> = {
  estudio_procesos_blueprint_erp: {
    amountEur: 300,
    name: "Estudio de procesos + Blueprint ERP (por sector)",
    taxCode: "txcd_10103001",
  },
};

export const POST: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const wantsJson = url.searchParams.get("json") === "1";
  const formData = await request.formData();

  const asunto = formData.get("asunto")?.toString();
  const precioRaw = formData.get("precio")?.toString();
  const emailRaw = formData.get("email");

  const catalogItem = asunto ? PRODUCT_CATALOG[asunto] : undefined;
  const precio = catalogItem?.amountEur ?? (precioRaw ? Number(precioRaw) : NaN);
  const email = emailRaw && typeof emailRaw === "string" ? emailRaw : undefined;

  console.log("➡️ FormData recibido:", { asunto, precio, email });

  if (!asunto || !precio || isNaN(precio)) {
    if (wantsJson) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios o precio inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response("Faltan campos obligatorios o precio inválido", { status: 400 });
  }

  try {
    const baseUrl = import.meta.env.PUBLIC_BASE_URL;
    const successUrl = `${baseUrl}/gracias?servicio=${encodeURIComponent(asunto)}`;

    const productName =
      catalogItem?.name ?? asunto.replace(/_/g, " ");
    const taxCode =
      catalogItem?.taxCode ?? "txcd_10103001";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: Math.round(precio * 100),
            product_data: {
              name: productName,
              tax_code: taxCode,
            },
          },
          quantity: 1,
        },
      ],
      automatic_tax: { enabled: true }, // 👉 habilita cálculo automático del IVA
      success_url: successUrl,
      cancel_url: `${baseUrl}/cancelado`,
      ...(email && { customer_email: email }),
    });

    console.log("✅ Sesión de Stripe creada:", session.url);

    if (wantsJson) {
      return new Response(JSON.stringify({ url: session.url }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

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
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error) {
    console.error("❌ Error creando sesión de Stripe:", error);
    if (wantsJson) {
      return new Response(JSON.stringify({ error: "Error al crear la sesión de Stripe" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("Error al crear la sesión de Stripe", { status: 500 });
  }
};
