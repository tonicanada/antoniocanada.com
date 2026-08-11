/**
 * Helper de analítica: punto único para empujar eventos al dataLayer de
 * Google Tag Manager. Evita tener múltiples `window.dataLayer.push(...)`
 * repartidos por el código. Ver docs/analytics.md para el contrato de
 * eventos disponibles.
 *
 * Seguro de importar/llamar durante SSR (no hace nada si `window` no existe).
 */
export function trackEvent(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
}

// Algunos componentes (p.ej. ServiceLeadForm.astro) usan `define:vars`, lo
// que fuerza a Astro a insertar su <script> directamente en el HTML de la
// página en vez de como archivo externo. Un `import` con ruta relativa ahí
// se resuelve contra la URL de la página, no contra este archivo — por eso
// exponemos `trackEvent` como global: esos scripts llaman a
// `window.trackEvent?.(...)` en vez de importar este módulo directamente.
// Este archivo sí se carga siempre pronto (vía TrackingInit.astro en el
// <head>, con un <script> normal que sí se compila como archivo externo).
if (typeof window !== "undefined") {
  window.trackEvent = trackEvent;
}

/**
 * Delegación de clicks por atributos `data-ev`/`data-ev-params`, para
 * instrumentar CTAs simples (whatsapp_click, service_cta_click, ...) sin
 * escribir JS específico en cada componente:
 *
 *   <a href="..." data-ev="whatsapp_click" data-ev-params='{"link_location":"sidebar_footer"}'>
 *
 * `page_path` se añade automáticamente; `data-ev-params` es opcional y debe
 * ser JSON válido si se usa.
 */
function bindDeclarativeClicks(): void {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const el = target.closest<HTMLElement>("[data-ev]");
    if (!el) return;

    const eventName = el.getAttribute("data-ev");
    if (!eventName) return;

    let params: Record<string, unknown> = {};
    const rawParams = el.getAttribute("data-ev-params");
    if (rawParams) {
      try {
        params = JSON.parse(rawParams);
      } catch {
        // JSON inválido en data-ev-params: ignoramos los parámetros extra
        // en vez de romper el clic del usuario.
      }
    }

    trackEvent(eventName, { page_path: window.location.pathname, ...params });
  });
}

/**
 * El sitio usa View Transitions de Astro entre páginas con BaseLayout, por lo
 * que la navegación entre ellas es parcial (tipo SPA) y GA4 solo vería el
 * `page_view` de la primera carga si no se refuerzan las siguientes.
 * Empujamos `virtual_pageview` en cada `astro:page-load` posterior a la
 * carga inicial (esa primera ya la cubre el `page_view` automático de la
 * configuración de GA4 al cargar GTM). Ver docs/analytics.md.
 */
function bindVirtualPageviews(): void {
  let isFirstLoad = true;

  document.addEventListener("astro:page-load", () => {
    if (isFirstLoad) {
      isFirstLoad = false;
      return;
    }

    trackEvent("virtual_pageview", {
      page_path: window.location.pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  });
}

let initialized = false;

/**
 * Inicializa el tracking declarativo (clicks) y el refuerzo de pageviews
 * para View Transitions. Se llama una única vez desde un <script> de <head>
 * (ver src/components/analytics/TrackingInit.astro), que no se reejecuta en
 * cada transición de página.
 */
export function initDeclarativeTracking(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (initialized) return;
  initialized = true;

  bindDeclarativeClicks();
  bindVirtualPageviews();
}
