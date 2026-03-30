// src/pages/api/create-checkout-session-bootcamp.ts
export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async () => {
  return new Response("El bootcamp ya no está disponible.", { status: 410 });
};
