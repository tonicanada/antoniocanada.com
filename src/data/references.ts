export type Reference = {
  logo?: string;
  company: string;
  url?: string;
  country: string;
  sector: string;
  scope: string;
  quote: string;
  person: string;
  role: string;
};

export const references: Reference[] = [
  {
    logo: "/logos/tecton.png",
    company: "Tecton",
    url: "https://www.tecton.cl",
    country: "Chile",
    sector: "Construcción",
    scope: "Finanzas, procesos y digitalización",
    quote:
      "Antonio combina muy bien criterio financiero, visión de procesos y capacidad tecnológica, aportando soluciones prácticas en entornos exigentes.",
    person: "Luis Izquierdo",
    role: "Gerente General",
  },
  {
    company: "Vegostar",
    country: "Bolivia",
    sector: "Tecnología",
    scope: "Capacitación ERPNext",
    quote:
      "Gracias a la experiencia y guía de Antonio durante sus capacitaciones, superamos una etapa importante que nos permitió avanzar con Frappe y ERPNext. Su apoyo será clave para fortalecer nuestra capacidad como proveedores de soluciones ERP.",
    person: "Gary García",
    role: "Gestor de Proyectos Tecnológicos",
  },
  {
    logo: "/logos/hostname.png",
    company: "Hostname",
    url: "https://www.hn.cl",
    country: "Chile",
    sector: "Tecnología",
    scope: "Automatización y soluciones digitales",
    quote:
      "Antonio nos ayudó a migrar de Odoo a ERPNext e integrar la contabilidad dentro de la operación diaria. Gracias a eso, hoy tenemos procesos más conectados, menos cajas negras y una visión mucho más clara de cómo va realmente el negocio.",
    person: "Hardy Hernández",
    role: "Gerente General",
  },
];
