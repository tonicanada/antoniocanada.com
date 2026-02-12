export const prerender = false;

import type { APIRoute } from "astro";
import { Resend } from "resend";

const NOTIFY_TO_DEFAULT = "toni.cm@gmail.com";
const FROM_DEFAULT = "Antonio Cañada <no-reply@antoniocanada.com>";

function getEnv(name: string): string | undefined {
  return (import.meta.env as Record<string, string | undefined>)[name];
}

function isValidServicio(servicio: unknown): servicio is string {
  if (typeof servicio !== "string") return false;
  const trimmed = servicio.trim();
  if (!trimmed) return false;
  if (trimmed.length > 120) return false;
  return /^[a-z0-9][a-z0-9_-]*[a-z0-9]$/i.test(trimmed) || /^[a-z0-9]$/i.test(trimmed);
}

function isValidEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  if (trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function optionalText(value: FormDataEntryValue | null, maxLen: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

function requiredText(value: FormDataEntryValue | null, field: string, maxLen: number): string {
  const v = optionalText(value, maxLen);
  if (!v) {
    throw new Error(`Falta el campo obligatorio: ${field}`);
  }
  return v;
}

export const POST: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const wantsRedirect = url.searchParams.get("redirect") === "1";

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: "Formulario inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // honeypot anti-spam
  const website = formData.get("website");
  if (typeof website === "string" && website.trim()) {
    return wantsRedirect
      ? Response.redirect("/", 303)
      : new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
  }

  try {
    const servicioRaw = formData.get("servicio");
    if (!isValidServicio(servicioRaw)) {
      return new Response(JSON.stringify({ error: "Servicio inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const emailRaw = formData.get("email");
    if (!isValidEmail(emailRaw)) {
      return new Response(JSON.stringify({ error: "Email inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const nombre = requiredText(formData.get("nombre"), "nombre", 120);
    const pais = requiredText(formData.get("pais"), "pais", 120);
    const objetivo = requiredText(formData.get("objetivo"), "objetivo", 5000);
    const empresa = optionalText(formData.get("empresa"), 200);
    const userUrl = optionalText(formData.get("url"), 500);

    const notifyEnabled =
      (getEnv("BOOKING_CLICK_NOTIFY") || "true").toLowerCase() !== "false";
    const apiKey = getEnv("RESEND_API_KEY");

    if (notifyEnabled && apiKey) {
      const resend = new Resend(apiKey);
      const to = getEnv("LEAD_NOTIFY_TO") || getEnv("BOOKING_CLICK_NOTIFY_TO") || NOTIFY_TO_DEFAULT;
      const from = getEnv("BOOKING_CLICK_FROM") || FROM_DEFAULT;

      const now = new Date().toISOString();
      const referer = request.headers.get("referer") || "(sin referer)";
      const userAgent = request.headers.get("user-agent") || "(sin user-agent)";
      const ip =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "(sin ip)";

      const subject = `🧾 Lead servicio: ${servicioRaw}`;
      const html = `
        <h2>Nueva solicitud antes de agendar</h2>
        <ul>
          <li><strong>Servicio:</strong> ${servicioRaw}</li>
          <li><strong>Email:</strong> ${emailRaw}</li>
          <li><strong>Nombre:</strong> ${nombre}</li>
          <li><strong>País:</strong> ${pais}</li>
          <li><strong>Empresa:</strong> ${empresa || "(no informado)"}</li>
          <li><strong>URL:</strong> ${userUrl || "(no informado)"}</li>
          <li><strong>Fecha (UTC):</strong> ${now}</li>
          <li><strong>IP:</strong> ${ip}</li>
          <li><strong>Referer:</strong> ${referer}</li>
          <li><strong>User-Agent:</strong> ${userAgent}</li>
        </ul>
        <h3>Objetivo principal</h3>
        <pre style="white-space:pre-wrap; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size:13px;">${objetivo}</pre>
      `;

      await resend.emails.send({
        from,
        to,
        subject,
        html,
        reply_to: String(emailRaw),
      });
    }

    if (wantsRedirect) {
      return Response.redirect(
        `/api/agendar?servicio=${encodeURIComponent(servicioRaw)}`,
        303
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};

