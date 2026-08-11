// Declaraciones globales para el dataLayer de Google Tag Manager / Consent
// Mode y el helper de consentimiento. Ver docs/analytics.md para el
// contrato completo de eventos.

export {};

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    trackEvent?: (eventName: string, params?: Record<string, unknown>) => void;
    /** Evita reinicializar vanilla-cookieconsent si el script se reejecuta. */
    __ccInitialized?: boolean;
  }
}
