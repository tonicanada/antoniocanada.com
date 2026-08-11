import * as CookieConsent from "vanilla-cookieconsent";

const COOKIE_NAME = "cc_antoniocanada";

/**
 * Traduce las categorías aceptadas en vanilla-cookieconsent a las 4 señales
 * de Google Consent Mode v2 y las envía vía `gtag('consent','update', ...)`.
 * `window.gtag` lo define src/components/analytics/GtmScripts.astro, que
 * siempre se carga antes que este script (ver orden en BaseLayout/index.astro).
 */
function updateGtagConsent(categories: string[]): void {
  if (typeof window === "undefined") return;

  const granted = (category: string) => (categories.includes(category) ? "granted" : "denied");
  const payload = {
    analytics_storage: granted("analytics"),
    ad_storage: granted("marketing"),
    ad_user_data: granted("marketing"),
    ad_personalization: granted("marketing"),
  };

  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", payload);
  } else {
    // Red de seguridad por si este script se ejecutara antes de tiempo:
    // replicamos el formato que generaría el stub de gtag.
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(["consent", "update", payload]);
  }
}

/**
 * Inicializa el banner de consentimiento (vanilla-cookieconsent) para todos
 * los visitantes. Se evaluó limitar la interfaz visible solo a España/UE/UK
 * (menos fricción para el resto del tráfico), pero requería que las páginas
 * dejaran de ser estáticas (el middleware de Astro no se ejecuta por
 * petición real en páginas prerenderizadas — ver docs/analytics.md), así
 * que se descartó a favor de esta versión más simple.
 *
 * El cumplimiento legal para visitantes de la UE no depende de esto en
 * ningún caso: lo garantiza el parámetro `region` de Consent Mode en
 * GtmScripts.astro, evaluado por Google con la IP real de cada visita.
 *
 * Seguro de llamar varias veces: solo se ejecuta una vez por sesión de página.
 */
export function initCookieConsent(): void {
  if (typeof window === "undefined") return;
  if (window.__ccInitialized) return;
  window.__ccInitialized = true;

  CookieConsent.run({
    mode: "opt-in",
    cookie: { name: COOKIE_NAME },
    guiOptions: {
      consentModal: {
        layout: "bar inline",
        position: "bottom",
        // false: "Aceptar todas" queda como acción primaria (botón sólido),
        // distinta de "Rechazar"/"Configurar". Solo afecta al estilo, ver
        // src/components/CookieConsentBanner.astro para el resto del ajuste
        // visual (jerarquía Rechazar vs. Configurar).
        equalWeightButtons: false,
        flipButtons: false,
      },
      preferencesModal: {
        layout: "box",
        equalWeightButtons: true,
      },
    },
    onFirstConsent: ({ cookie }) => updateGtagConsent(cookie.categories),
    onConsent: ({ cookie }) => updateGtagConsent(cookie.categories),
    onChange: ({ cookie }) => updateGtagConsent(cookie.categories),
    categories: {
      necessary: {
        enabled: true,
        readOnly: true,
      },
      analytics: {
        autoClear: {
          cookies: [{ name: /^_ga/ }, { name: "_clck" }, { name: "_clsk" }],
        },
      },
      // Categoría reservada para una futura publicidad/remarketing (p.ej.
      // Google Ads). No hay ningún servicio activo en ella todavía.
      marketing: {},
    },
    language: {
      default: "es",
      translations: {
        es: {
          consentModal: {
            // Sin `title` visible (banner más compacto); `label` mantiene un
            // nombre accesible para el lector de pantalla sobre la región.
            label: "Consentimiento de cookies",
            description:
              "Utilizamos cookies analíticas para medir el uso de la web y mejorar nuestros servicios.",
            acceptAllBtn: "Aceptar todas",
            acceptNecessaryBtn: "Rechazar",
            showPreferencesBtn: "Configurar",
          },
          preferencesModal: {
            title: "Preferencias de privacidad",
            acceptAllBtn: "Aceptar todas",
            acceptNecessaryBtn: "Rechazar",
            savePreferencesBtn: "Guardar preferencias",
            closeIconLabel: "Cerrar",
            serviceCounterLabel: "Servicio(s)",
            sections: [
              {
                title: "Cookies necesarias",
                description:
                  "Imprescindibles para el funcionamiento básico del sitio. Siempre activas y no requieren consentimiento.",
                linkedCategory: "necessary",
              },
              {
                title: "Analítica",
                description:
                  "Nos permiten medir el uso del sitio de forma agregada (Google Analytics 4, Microsoft Clarity) para mejorar contenidos y servicios.",
                linkedCategory: "analytics",
              },
              {
                title: "Marketing",
                description:
                  "Reservado para una futura publicidad o remarketing (p. ej. Google Ads). Actualmente no se usa ningún servicio en esta categoría.",
                linkedCategory: "marketing",
              },
            ],
          },
        },
      },
    },
  });
}
