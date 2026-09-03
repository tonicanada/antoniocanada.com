/**
 * De qué está compuesto un proyecto.
 *
 * El problema que resuelve este fichero: con las seis tarjetas anteriores casi
 * todo decía "A medida", y eso es lo que estrechaba el embudo — el visitante no
 * sabía si podía pagarlo y no llamaba. La salida acordada no es publicar un
 * "desde X" (que no explica nada y espanta), sino publicar **la composición**:
 * precio fijo en lo predecible y presupuesto sólo en lo que de verdad varía.
 *
 * Los importes se rellenan aquí y aparecen solos en /services. Mientras un
 * componente no tenga precio, la tabla muestra únicamente CÓMO se cobra, que ya
 * es más de lo que decía antes. No se inventan cifras ni se ponen de relleno.
 *
 * Moneda por país: CLP para Chile, EUR para España.
 */

export type ModoCobro = "gratis" | "fijo" | "presupuesto" | "mensual";

export type ComponenteServicio = {
  nombre: string;
  queEs: string;
  modo: ModoCobro;
  /** Pesos chilenos, sin decimales. */
  precioCLP?: number;
  /** Euros. */
  precioEUR?: number;
  /** Por qué varía, cuando el modo es presupuesto. */
  porQueVaria?: string;
};

export const componentes: ComponenteServicio[] = [
  {
    nombre: "Consulta inicial",
    queEs:
      "Llamada de 15–20 minutos: qué sistemas usas hoy, qué se puede unificar y qué no, y una ruta con orden y plazos.",
    modo: "gratis",
  },
  {
    nombre: "Estudio de procesos y blueprint",
    queEs:
      "Análisis de tus procesos y entregable escrito: módulos, automatizaciones y plan por fases. Es el primer paso de pago, y sirve aunque después no me contrates.",
    modo: "fijo",
    precioEUR: 300,
  },
  {
    nombre: "Puesta en marcha de ERPNext",
    queEs:
      "Instalación, empresas, plan de cuentas, impuestos, usuarios y permisos por perfil. El sistema funcionando con tu estructura real.",
    modo: "fijo",
  },
  {
    nombre: "Localización fiscal",
    queEs:
      "Chile: SII, DTE, folios, RCV. España: plan contable y Veri*Factu. Precio fijo por país.",
    modo: "fijo",
  },
  {
    nombre: "Migración de datos",
    queEs:
      "Traer maestros e histórico desde tu sistema actual: clientes, proveedores, artículos, saldos, movimientos.",
    modo: "presupuesto",
    porQueVaria:
      "Depende de dos cosas: cuántos años de histórico quieres conservar, y si el sistema de origen tiene API o hay que extraer los datos de informes. Es la única línea que no puede llevar precio fijo — y si tu sistema actual no tiene API, hasta salir de él sale más caro.",
  },
  {
    nombre: "Integraciones",
    queEs:
      "Precio fijo por integración: banco, compras y licitaciones, facturación electrónica, IA por MCP, ecommerce, pagos.",
    modo: "fijo",
  },
  {
    nombre: "Hosting, soporte y actualizaciones",
    queEs:
      "El sistema alojado en nuestros servidores, con respaldos, monitoreo, actualizaciones de versión y soporte. Cuota mensual.",
    modo: "mensual",
  },
  {
    nombre: "Capacitación",
    queEs:
      "Bloques de horas, para usuarios o para equipos técnicos que van a mantener y extender el sistema.",
    modo: "fijo",
  },
];

const etiquetas: Record<ModoCobro, string> = {
  gratis: "Gratis",
  fijo: "Precio fijo",
  presupuesto: "Por presupuesto",
  mensual: "Mensual",
};

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});
const eur = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** "Precio fijo — 300 €" cuando hay importe; sólo el modo cuando todavía no. */
export function comoSeCobra(c: ComponenteServicio): string {
  const importes = [
    c.precioCLP != null ? clp.format(c.precioCLP) : null,
    c.precioEUR != null ? eur.format(c.precioEUR) : null,
  ].filter(Boolean);

  if (c.modo === "gratis") return etiquetas.gratis;
  if (importes.length === 0) return etiquetas[c.modo];
  return `${etiquetas[c.modo]} — ${importes.join(" · ")}`;
}
