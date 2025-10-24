// src/pages/api/stripe-webhook-bootcamp-nov2025.ts
export const prerender = false;

import type { APIRoute } from "astro";
import Stripe from "stripe";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

// Inicialización de Stripe
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// Inicialización de Resend
const resend = new Resend(import.meta.env.RESEND_API_KEY!);

// 📎 Cargamos el archivo .ICS para adjuntarlo en el correo
const icsPath = path.resolve("public/assets/downloads/bootcamp-erpnext-2025.ics");
const icsContent = fs.readFileSync(icsPath).toString("base64");

export const POST: APIRoute = async ({ request }) => {
  // ✅ Capturamos la cabecera de firma
  const sig = request.headers.get("stripe-signature");

  // ⚠️ IMPORTANTE: leemos el cuerpo en crudo (no como texto)
  const rawBody = Buffer.from(await request.arrayBuffer());

  let event: Stripe.Event;

  try {
    // 🧩 Verificamos la firma del evento (ahora sí, con el cuerpo original)
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      import.meta.env.STRIPE_WEBHOOK_SECRET_BOOTCAMP_NOV2025!
    );
  } catch (err) {
    console.error("❌ Error verificando firma Stripe:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    // 🎯 Solo respondemos a pagos completados
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Verificamos que sea el Bootcamp (por metadata)
      if (session.metadata?.cohort === "bootcamp-nov-2025") {
        const email = session.customer_details?.email;
        if (email) {
          console.log(`✅ Enviando confirmación Bootcamp ERPNext 2025 a ${email}`);

          await resend.emails.send({
            from: "Antonio Cañada <no-reply@antoniocanada.com>",
            to: email,
            subject: "🎓 Bootcamp ERPNext 2025 — Inscripción confirmada",
            html: `
              <h2>¡Gracias por inscribirte en el Bootcamp ERPNext 2025!</h2>
              <p>Tu pago se ha procesado correctamente y tu plaza está reservada.</p>

              <p><strong>Fechas:</strong> 25, 26 y 27 de noviembre de 2025</p>
              <p><strong>Horario:</strong> 17:00–18:30 (España) · 13:00 (Chile/Argentina) · 11:00 (Perú/Colombia)</p>

              <p>
                📍 <a href="https://antoniocanada.com/bootcamp-erpnext-2025-sala-8r3jhf" target="_blank">
                Acceder a la sala del Bootcamp (Google Meet)
                </a>
              </p>
              <p style="font-size:13px; color:#666;">
                (Este enlace siempre te llevará al acceso actualizado del Bootcamp)
              </p>

              <p>Puedes añadir las sesiones a tu calendario con el archivo adjunto (.ics).</p>
              <hr />
              <p>Nos vemos pronto 👋</p>
              <p>Antonio Cañada</p>
            `,
            attachments: [
              {
                filename: "bootcamp_erpnext_2025.ics",
                content: icsContent,
              },
            ],
            reply_to: "toni.cm@gmail.com",
          });
        }
      } else {
        console.log("⚠️ Pago recibido pero no corresponde al Bootcamp. Ignorado.");
      }
    }

    return new Response("Webhook recibido correctamente", { status: 200 });
  } catch (err) {
    console.error("❌ Error procesando webhook Bootcamp:", err);
    return new Response("Error interno en webhook", { status: 500 });
  }
};
