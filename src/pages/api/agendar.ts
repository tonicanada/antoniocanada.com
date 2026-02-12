export const prerender = false;

import type { APIRoute } from "astro";

function getEnv(name: string): string | undefined {
  return (import.meta.env as Record<string, string | undefined>)[name];
}

export const GET: APIRoute = async () => {
  const bookingUrl =
    getEnv("GOOGLE_CALENDAR_BOOKING_URL") || getEnv("PUBLIC_GOOGLE_CALENDAR_BOOKING_URL");

  if (!bookingUrl) {
    return new Response(
      "Falta configurar GOOGLE_CALENDAR_BOOKING_URL o PUBLIC_GOOGLE_CALENDAR_BOOKING_URL",
      { status: 500 }
    );
  }

  let target: URL;
  try {
    target = new URL(bookingUrl);
  } catch {
    return new Response(
      "GOOGLE_CALENDAR_BOOKING_URL/PUBLIC_GOOGLE_CALENDAR_BOOKING_URL inválida",
      { status: 500 }
    );
  }

  return Response.redirect(target.toString(), 303);
};
