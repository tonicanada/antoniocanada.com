/**
 * Valor de la UF, para mostrar la referencia en pesos junto al precio en UF.
 *
 * Por qué los precios de Chile se denominan en UF y no en pesos: publicar en
 * CLP facturando en euros deja el riesgo de tipo de cambio del lado de quien
 * publica. Si el peso se mueve un 8% —que pasa sin ser noticia— o pierdes
 * margen o tienes que decirle al cliente que el precio subió, y esa
 * conversación al principio de una relación es cara. Denominar en UF es la
 * convención chilena para exactamente esto, y un cliente chileno lo entiende
 * sin explicación.
 *
 * La UF manda contractualmente; el peso es sólo una ayuda de lectura, porque la
 * UF cuesta más de leer de un vistazo para quien evalúa rápido.
 *
 * `null` a propósito: mientras no haya un valor verificado, la tabla muestra el
 * precio en UF y ninguna referencia en pesos, en vez de una cifra inventada.
 *
 * Para activarla: poner el valor con su fecha. La fecha se muestra junto a la
 * referencia — si algún día esto se automatiza con una recompilación
 * programada y la consulta falla, un valor viejo se ve en vez de pasar
 * desapercibido.
 */
export type ValorUF = {
  /** Pesos por UF. */
  valor: number;
  /** ISO (YYYY-MM-DD), la del valor usado. */
  fecha: string;
};

export const ufActual: ValorUF | null = null;
