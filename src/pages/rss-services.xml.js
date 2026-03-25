import rss from "@astrojs/rss";

const serviceItems = [
  {
    title: "Consulta inicial",
    description:
      "Primera reunión para entender tu caso y proponerte el mejor siguiente paso según tu situación.",
    link: "/services/consulta-inicial/",
    pubDate: new Date("2026-03-25"),
  },
  {
    title: "Estudio de procesos + Blueprint ERP (por sector)",
    description:
      "Estudio personalizado con entregable de blueprint/roadmap por fases, módulos y automatizaciones.",
    link: "/services/diagnostico-procesos/",
    pubDate: new Date("2026-03-25"),
  },
  {
    title: "Pack España: ERPNext + Contabilidad + Veri*Factu",
    description:
      "ERPNext adaptado a España con contabilidad, emisión Veri*Factu y validación de facturas.",
    link: "/services/pack-espana-verifactu/",
    pubDate: new Date("2026-03-25"),
  },
  {
    title: "Implementación ERPNext",
    description:
      "Instalación, configuración y acompañamiento para arrancar ERPNext en tu empresa.",
    link: "/services/implementacion-erpnext/",
    pubDate: new Date("2026-03-25"),
  },
  {
    title: "Automatización y personalización ERPNext",
    description:
      "Desarrollos a medida, automatización de procesos e integraciones con sistemas externos.",
    link: "/services/automatizacion-erpnext/",
    pubDate: new Date("2026-03-25"),
  },
  {
    title: "Capacitación técnica en ERPNext y desarrollo",
    description:
      "Formación técnica para desarrolladores y equipos en Frappe, ERPNext e integraciones.",
    link: "/services/capacitacion-tecnica-erpnext/",
    pubDate: new Date("2026-03-25"),
  },
];

export async function GET(context) {
  return rss({
    title: "Antonio Cañada | Servicios",
    description: "Catálogo de servicios profesionales disponibles en antoniocanada.com.",
    site: context.site,
    items: serviceItems,
  });
}
