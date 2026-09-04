export const prerender = false;

import type { APIRoute } from "astro";
import Stripe from "stripe";
import { componentes, paises } from "../../data/servicios";

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

type CheckoutProduct = {
  /** Componente de src/data/servicios.ts del que sale el importe. */
  componente: string;
  name: string;
  taxCode?: string;
};

// El importe NO se escribe aquí: sale de src/data/servicios.ts, que es lo que
// muestra la web. Tenerlo en dos sitios significaba que cambiar el precio en la
// página dejaba a Stripe cobrando el viejo.
const PRODUCT_CATALOG: Record<string, CheckoutProduct> = {
  estudio_procesos_blueprint_erp: {
    componente: "Estudio de procesos y blueprint",
    name: "Estudio de procesos + Blueprint ERP (por sector)",
    taxCode: "txcd_10103001",
  },
};

/**
 * Se factura desde España, así que se cobra en euros. El importe se lee del
 * componente correspondiente.
 */
function precioEurDe(nombreComponente: string): number | undefined {
  return componentes.find((c) => c.nombre === nombreComponente)?.paises?.es
    ?.precio;
}

export const POST: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const wantsJson = url.searchParams.get("json") === "1";
  const formData = await request.formData();

  const asunto = formData.get("asunto")?.toString();
  const emailRaw = formData.get("email");

  // El precio y la moneda salen SIEMPRE del servidor. Antes, si `asunto` no
  // estaba en el catálogo, el importe se tomaba del campo `precio` del
  // formulario: cualquiera podía enviar un POST con un asunto cualquiera y
  // `precio=1` y generar una sesión de pago legítima de 1 €. El catálogo tiene
  // una sola entrada, así que bastaba con no usar esa clave.
  const catalogItem = asunto ? PRODUCT_CATALOG[asunto] : undefined;
  const precio = catalogItem ? precioEurDe(catalogItem.componente) : undefined;

  console.log("➡️ Checkout solicitado:", { asunto, precio });

  if (!catalogItem) {
    const error = "Producto no disponible";
    if (wantsJson) {
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(error, { status: 400 });
  }

  if (precio == null || !Number.isFinite(precio) || precio <= 0) {
    console.error(
      `❌ Sin precio para el componente "${catalogItem.componente}" en ${paises.es.nombre}. Rellenar src/data/servicios.ts.`
    );
    const error = "Este producto no tiene precio publicado todavía";
    if (wantsJson) {
      return new Response(JSON.stringify({ error }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(error, { status: 409 });
  }

  const email = emailRaw && typeof emailRaw === "string" ? emailRaw : undefined;

  try {
    const baseUrl = import.meta.env.PUBLIC_BASE_URL;
    const successUrl = `${baseUrl}/gracias?servicio=${encodeURIComponent(asunto)}`;

    const productName = catalogItem.name;
    const taxCode = catalogItem.taxCode ?? "txcd_10103001";

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
