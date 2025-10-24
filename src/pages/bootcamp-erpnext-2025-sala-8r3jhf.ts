// src/pages/bootcamp-erpnext-2025-sala.ts
export const prerender = false;

import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const meetUrl = import.meta.env.PUBLIC_BOOTCAMP_NOV2025_MEET_URL;

  if (!meetUrl) {
    return new Response("No se ha configurado la URL del Meet", { status: 500 });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: meetUrl },
  });
};
