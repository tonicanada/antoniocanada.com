/**
 * El sitio se sirve con barra final (`trailingSlash: true` en `vercel.json`),
 * así que `/services/` es la URL canónica y `/services` responde con un
 * redirect 308. Ese redirect solo actúa cuando la petición llega al servidor:
 * con las View Transitions de Astro, un enlace interno lo resuelve el router
 * en el cliente y la URL se queda tal cual se escribió.
 *
 * El coste no es cosmético. GA4 guarda la ruta literal de cada visita, de modo
 * que una misma página acumulaba sus vistas repartidas entre dos filas —
 * `/services` y `/services/`— según por dónde hubiera entrado cada visitante,
 * y ninguna de las dos contaba la verdad.
 *
 * Los enlaces escritos a mano se pueden cerrar uno a uno; los que se generan
 * desde el slug de cada contenido (tarjetas, tags, listados) son cientos y
 * cambian con el contenido, así que se normalizan aquí, en el punto donde se
 * pintan.
 *
 * Se deja intacto todo lo que no sea una ruta interna simple: URLs absolutas,
 * protocol-relative, anclas, query strings y rutas a archivos con extensión
 * (`/llms.txt`, `/rss.xml`), que no llevan barra final.
 */
export function rutaInterna<T extends string | undefined | null>(url: T): T {
  if (typeof url !== "string") return url;
  if (!url.startsWith("/") || url.startsWith("//")) return url;
  if (url.endsWith("/")) return url;
  if (url.includes("?") || url.includes("#")) return url;
  if (/\.[a-z0-9]+$/i.test(url)) return url;
  return `${url}/` as T;
}
