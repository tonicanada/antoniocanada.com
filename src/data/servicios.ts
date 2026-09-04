/**
 * De qué está compuesto un proyecto, y qué cuesta en cada país.
 *
 * El problema que resuelve este fichero: con las seis tarjetas anteriores casi
 * todo decía "A medida", y eso es lo que estrechaba el embudo — el visitante no
 * sabía si podía pagarlo y no llamaba. La salida acordada no es publicar un
 * "desde X" (que no explica nada y espanta), sino publicar **la composición**:
 * precio fijo en lo predecible y presupuesto sólo en lo que de verdad varía.
 *
 * Los importes viven por país, y no sólo por la moneda: el CONTENIDO del
 * componente cambia. "Localización fiscal" en Chile es SII, DTE, folios y RCV;
 * en España es plan contable y Veri*Factu. Son trabajos distintos, no el mismo
 * trabajo a otro precio. Y algunas integraciones existen sólo en un país
 * (Fintoc, Wherex).
 *
 * Por eso los importes NO se muestran en /services: ahí llega también quien
 * está en México, Perú o Bolivia, para quien ninguna de las dos monedas aplica,
 * y ver las dos tablas juntas obligaría a explicar por qué el mismo componente
 * cuesta distinto. Cada país tiene su página y su tabla.
 *
 * Para rellenar: pon `precio` en la variante del país, en su moneda y sin
 * decimales. Mientras no lo haya, la tabla muestra sólo cómo se cobra, que ya
 * es más de lo que decía antes. No se ponen cifras de relleno.
 *
 * Al fijar los números, tres criterios: (1) la estructura tiene que ser
 * idéntica entre países —mismos componentes y mismos modos de cobro—, el
 * importe no; (2) no convertir con el tipo de cambio, fijar por mercado, pero
 * cuidando las proporciones entre componentes; (3) redondear a cifras
 * memorables en cada moneda (1.500.000 CLP, no lo que salga de convertir).
 */

import { ufActual } from "./uf";

export type ModoCobro = "gratis" | "fijo" | "presupuesto" | "mensual";

export type CodigoPais = "cl" | "es";

export type Pais = {
  codigo: CodigoPais;
  nombre: string;
  url: string;
  /** Unidad en la que se DENOMINA el precio. En Chile, UF. */
  unidad: "UF" | "EUR";
  /** Moneda en la que se muestra la referencia, si la unidad no es una moneda. */
  monedaReferencia?: "CLP";
  locale: string;
};

export const paises: Record<CodigoPais, Pais> = {
  cl: {
    codigo: "cl",
    nombre: "Chile",
    url: "/chile/",
    unidad: "UF",
    monedaReferencia: "CLP",
    locale: "es-CL",
  },
  es: { codigo: "es", nombre: "España", url: "/espana/", unidad: "EUR", locale: "es-ES" },
};

export type Variante = {
  /** Sustituye a `queEs` en la página de ese país. */
  queEs?: string;
  /** En la unidad del país: UF en Chile, euros en España. */
  precio?: number;
  /** El componente no se ofrece en ese país. */
  noAplica?: boolean;
  /** Sustituye al importe en la columna de precio, para lo que no tiene un
      número único (el modelado va por tramos, no por precio fijo). Un hueco en
      esa columna se lee como "sin decidir", que es lo que la cabecera
      adaptativa vino a evitar. */
  precioNota?: string;
};

export type ComponenteServicio = {
  nombre: string;
  /** Descripción neutra, la que se ve en /services. */
  queEs: string;
  modo: ModoCobro;
  /** Por qué varía, cuando el modo es presupuesto. */
  porQueVaria?: string;
  /** Página propia del componente, si la tiene. */
  enlace?: string;
  paises?: Partial<Record<CodigoPais, Variante>>;
};

export const componentes: ComponenteServicio[] = [
  {
    nombre: "Consulta inicial",
    enlace: "/services/consulta-inicial/",
    queEs:
      "Llamada de 15–20 minutos: qué sistemas usas hoy, qué se puede unificar y qué no, y una ruta con orden y plazos.",
    modo: "gratis",
  },
  {
    nombre: "Estudio de procesos y blueprint",
    enlace: "/services/diagnostico-procesos/",
    queEs:
      "Análisis de tus procesos y entregable escrito: módulos, automatizaciones y plan por fases. Se descuenta del proyecto si seguimos adelante, y el documento es tuyo aunque no me contrates.",
    modo: "fijo",
    paises: {
      // 8 UF y 300 € son equivalentes en términos reales al fijarlos (1 € ≈
      // 1.083 CLP, UF ≈ 40.879 el 2026-09-04). Se mantienen a la par porque es
      // el mismo trabajo y las mismas horas, y porque el descuento sobre el
      // proyecto ya neutraliza la objeción de precio. La cifra es redonda a
      // propósito: la conversión sirvió de control de cordura, no de método.
      cl: { precio: 8 },
      es: { precio: 300 },
    },
  },
  {
    nombre: "Puesta en marcha de ERPNext",
    enlace: "/services/migracion-erpnext/",
    queEs:
      "Instalación, empresas, plan de cuentas, impuestos, usuarios y permisos por perfil. El sistema funcionando con tu estructura real.",
    modo: "fijo",
    paises: {
      cl: { precio: 40 },
      es: { precio: 1500 },
    },
  },
  {
    nombre: "Modelado de tus procesos",
    enlace: "/services/migracion-erpnext/#procesos",
    queEs:
      "Los flujos que tu empresa ya tiene, entendidos, depurados y modelados dentro del sistema: aprobaciones, estados de documento, controles y responsables por perfil. Precio fijo por proceso, según su tramo.",
    // Tres tramos y no un precio único, así que la cifra va en la descripción
    // de cada país: un "desde" ancla bajo y no explica nada.
    modo: "fijo",
    paises: {
      cl: {
        precioNota: "10, 20 o 40 UF",
        queEs:
          "Los flujos que tu empresa ya tiene, entendidos, depurados y modelados dentro del sistema. En construcción, por ejemplo: control de subcontratos, resultado por obra, cajas chicas, provisiones y permisos por perfil. 10, 20 o 40 UF por proceso según su tramo.",
      },
      es: {
        precioNota: "400, 800 o 1.500 €",
        queEs:
          "Los flujos que tu empresa ya tiene, entendidos, depurados y modelados dentro del sistema: aprobaciones, estados de documento, controles y responsables por perfil. 400, 800 o 1.500 € por proceso según su tramo.",
      },
    },
  },
  {
    nombre: "Localización fiscal",
    queEs:
      "La contabilidad y la facturación electrónica de tu país, configuradas y conectadas. Precio fijo por país.",
    modo: "fijo",
    paises: {
      cl: {
        precio: 24,
        queEs:
          "Plan de cuentas chileno, impuestos para el F29, y la conexión con el SII: emisión de DTE con folios CAF, recepción, RCV y aceptación o reclamo.",
      },
      es: {
        precio: 900,
        queEs:
          "Plan contable español, IVA y retenciones, y emisión con Veri*Factu: PDF con QR validable ante Hacienda, incluidas las facturas rectificativas.",
      },
    },
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
    enlace: "/integraciones/",
    queEs:
      "Precio fijo por integración: banco, compras y licitaciones, facturación electrónica, IA por MCP, ecommerce, pagos.",
    modo: "fijo",
    paises: {
      cl: {
        precio: 18,
        queEs:
          "Precio fijo por integración. En Chile: banco vía Fintoc, licitaciones vía Wherex, IA por MCP, ecommerce y pagos.",
      },
      es: {
        precio: 700,
        queEs:
          "Precio fijo por integración: banco, IA por MCP, ecommerce y pagos. Las de sourcing local se evalúan según la plataforma que uses.",
      },
    },
  },
  {
    nombre: "Infraestructura",
    enlace: "/services/hosting-soporte/",
    queEs:
      "El sistema alojado con respaldos automáticos, monitorización, SSL y dominio, actualizaciones de seguridad y recuperación ante incidencias. No incluye soporte funcional.",
    modo: "mensual",
    paises: { cl: { precio: 2 }, es: { precio: 79 } },
  },
  {
    nombre: "Sistema mantenido",
    enlace: "/services/hosting-soporte/",
    queEs:
      "Todo lo anterior más lo que mantiene tu sistema al día: actualizaciones de ERPNext con tus personalizaciones probadas, mantenimiento de las apps instaladas, actualizaciones de la localización fiscal y una hora mensual de soporte.",
    modo: "mensual",
    paises: { cl: { precio: 6 }, es: { precio: 249 } },
  },
  {
    nombre: "Capacitación",
    enlace: "/services/capacitacion-tecnica-erpnext/",
    queEs:
      "Bloques de horas, para usuarios o para equipos técnicos que van a mantener y extender el sistema.",
    modo: "fijo",
    paises: {
      cl: { precio: 10 },
      es: { precio: 400 },
    },
  },
];

/**
 * Tramos del modelado de procesos.
 *
 * Por qué precio fijo y no "por presupuesto", aunque cada empresa tenga sus
 * procesos: el CONTENIDO varía, pero la FORMA mucho menos. Modelado en ERPNext,
 * un proceso casi siempre se descompone en las mismas piezas — un documento (o
 * campos sobre uno que ya existe), estados y transiciones, permisos por rol,
 * validaciones, un informe, a veces una tarea programada. "Aprobación de
 * compras por monto" y "aprobación de vacaciones por jefatura" son negocios
 * distintos y casi el mismo trabajo, así que el esfuerzo correlaciona con
 * cuántas de esas piezas hacen falta, no con de qué va el proceso.
 *
 * Un precio plano sí sería un error: cajas chicas no es control de
 * subcontratos. De ahí los tramos, definidos por lo que CONTIENEN y no por el
 * sector.
 *
 * La pieza que hace que esto funcione: **el tramo se asigna en el blueprint**,
 * no a ciegas. El cliente sale de ahí con su lista de procesos, cada uno en su
 * tramo, y el total sumado antes de comprometerse a la implantación.
 *
 * Descartado "por presupuesto": metería una segunda línea sin precio en la
 * tabla y, peor, el cliente no podría estimar nada hasta después de pagar el
 * blueprint — la opacidad que la tabla vino a quitar. Y descartada la bolsa de
 * horas: vende tiempo en vez de resultado, invita a contar horas, y el cliente
 * no sabe qué va a tener al final.
 *
 * El riesgo que queda: de vez en cuando un proceso que parecía medio resulta
 * complejo y ese se cobra de menos. Es asumible porque el tramo se asigna
 * después del blueprint y porque la definición dice qué incluye, así que lo que
 * queda fuera se habla antes. Un proceso que no quepa en ningún tramo va por
 * presupuesto, como excepción y no como norma.
 */
export type TramoProceso = {
  nombre: string;
  queIncluye: string;
  ejemplos: string;
  precios?: Partial<Record<CodigoPais, number>>;
};

export const tramosProceso: TramoProceso[] = [
  {
    nombre: "Simple",
    queIncluye:
      "Sobre documentos que ya existen: campos, validaciones, permisos y un informe.",
    ejemplos:
      "Permisos por bodega e informe de consumos · cajas chicas con una rendición y un aprobador",
    precios: { cl: 10, es: 400 },
  },
  {
    nombre: "Medio",
    queIncluye:
      "Documento propio con estados y aprobaciones, más su informe.",
    ejemplos:
      "Aprobación de compras por monto · solicitudes desde sucursales · cajas chicas con varias obras, anticipos y reintegros",
    precios: { cl: 20, es: 800 },
  },
  {
    nombre: "Complejo",
    queIncluye:
      "Varios documentos enlazados, cálculos, y efecto en contabilidad o inventario.",
    ejemplos: "Control de subcontratos · provisiones · resultado por proyecto",
    precios: { cl: 40, es: 1500 },
  },
];

/** Precio de un tramo en un país, ya formateado, o null si aún no está puesto. */
export function precioTramo(t: TramoProceso, pais: Pais): string | null {
  const precio = t.precios?.[pais.codigo];
  return precio == null ? null : importe(pais, precio);
}

const etiquetas: Record<ModoCobro, string> = {
  gratis: "Gratis",
  fijo: "Precio fijo",
  presupuesto: "Por presupuesto",
  mensual: "Mensual",
};

/**
 * El importe en la unidad del país. La UF no es una moneda ISO, así que Intl no
 * la formatea como tal: se formatea el número y se le pone la unidad detrás,
 * con la referencia en pesos cuando hay un valor de UF configurado.
 */
function importe(pais: Pais, precio: number): string {
  if (pais.unidad === "UF") {
    const uf = new Intl.NumberFormat(pais.locale, {
      maximumFractionDigits: 1,
    }).format(precio);
    if (!ufActual || !pais.monedaReferencia) return `${uf} UF`;
    const pesos = new Intl.NumberFormat(pais.locale, {
      style: "currency",
      currency: pais.monedaReferencia,
      maximumFractionDigits: 0,
      useGrouping: "always",
    }).format(precio * ufActual.valor);
    return `${uf} UF (≈ ${pesos})`;
  }

  return new Intl.NumberFormat(pais.locale, {
    style: "currency",
    currency: pais.unidad,
    maximumFractionDigits: 0,
    useGrouping: "always",
  }).format(precio);
}

/**
 * Cómo se cobra un componente. Sin país, sólo el modo — es lo que ve /services.
 * Con país, el modo más el importe si está puesto.
 */
export function comoSeCobra(c: ComponenteServicio, pais?: Pais): string {
  if (c.modo === "gratis") return etiquetas.gratis;
  if (!pais) return etiquetas[c.modo];

  const nota = c.paises?.[pais.codigo]?.precioNota;
  if (nota) return `${etiquetas[c.modo]} — ${nota}`;

  const precio = c.paises?.[pais.codigo]?.precio;
  if (precio == null) return etiquetas[c.modo];
  return `${etiquetas[c.modo]} — ${importe(pais, precio)}`;
}

/**
 * Si algún componente de ese país tiene importe. La cabecera de la tabla lo
 * usa: una columna titulada "Precio (UF)" con todas las celdas diciendo
 * "Precio fijo" no se lee como pendiente, se lee como roto.
 */
export function hayPrecios(pais: Pais): boolean {
  return componentes.some((c) => c.paises?.[pais.codigo]?.precio != null);
}

/** Los componentes de un país, con su descripción local y sin los que no aplican. */
export function componentesDe(pais: Pais): ComponenteServicio[] {
  return componentes
    .filter((c) => !c.paises?.[pais.codigo]?.noAplica)
    .map((c) => {
      const v = c.paises?.[pais.codigo];
      return v?.queEs ? { ...c, queEs: v.queEs } : c;
    });
}
