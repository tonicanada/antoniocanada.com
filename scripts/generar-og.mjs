/**
 * Genera las imágenes sociales (Open Graph) del sitio.
 *
 *   node scripts/generar-og.mjs
 *
 * Por qué existe: ninguna página tenía imagen social propia — todas compartían
 * `/social_img.webp`, así que compartir /erpnext en LinkedIn o WhatsApp mostraba
 * una imagen genérica en vez del titular de la página. Con el 77% del tráfico
 * llegando directo, y buena parte de eso enlaces compartidos, es mucho
 * desperdicio para lo que cuesta arreglarlo.
 *
 * Se dibuja en SVG y se rasteriza con sharp, que ya era dependencia del
 * proyecto. El PNG resultante se commitea: generarlo en cada build sería más
 * elegante pero añade una pieza que puede fallar en el despliegue, y estas
 * imágenes cambian una vez cada muchos meses.
 *
 * Tipografía: el sitio no declara ninguna familia, usa la pila del sistema
 * (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, …`), que en cada
 * dispositivo resuelve a algo distinto. Aquí se fija Roboto porque está
 * instalada en la máquina que genera las imágenes y es la que esa misma pila
 * elige en Linux y Android — un grotesco neutro que lee como el sitio.
 * Si se genera en otra máquina sin Roboto, el texto saldrá con otra fuente:
 * el script avisa antes de escribir nada.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const salida = join(raiz, "public", "og");

// 1200×630 es la proporción que piden LinkedIn, WhatsApp, Slack y X.
const ANCHO = 1200;
const ALTO = 630;

// La paleta del sitio, tal cual: monocroma, sin acentos de color. El negro
// pleno está reservado al botón de agendar, así que aquí tampoco aparece.
const c = {
  fondo: "#ffffff",
  reticula: "#e5e7eb", // gray-200 — la retícula de GridBackground, muy tenue
  texto: "#111827", // gray-900
  secundario: "#4b5563", // gray-600
  tenue: "#6b7280", // gray-500
  borde: "#d1d5db", // gray-300
};

const FUENTE = "Roboto, Arial, sans-serif";

const escapar = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Una tarjeta: antetítulo, titular en varias líneas, una regla, un pie de
 * datos y el dominio. El titular llega ya partido en líneas a propósito — un
 * ajuste automático tendría que medir texto, y a esta escala se decide mejor a
 * mano dónde corta cada frase.
 */
function tarjeta({ antetitulo, titular, pie }) {
  const margen = 88;
  const tamTitular = titular.length > 2 ? 74 : 86;
  const interlineado = Math.round(tamTitular * 1.16);
  const yTitular = 250;
  const lineas = titular
    .map(
      (linea, i) =>
        `<tspan x="${margen}" y="${yTitular + i * interlineado}">${escapar(linea)}</tspan>`,
    )
    .join("");
  const yRegla = yTitular + (titular.length - 1) * interlineado + 62;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}" viewBox="0 0 ${ANCHO} ${ALTO}">
  <defs>
    <pattern id="reticula" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M64 0 H0 V64" fill="none" stroke="${c.reticula}" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${ANCHO}" height="${ALTO}" fill="${c.fondo}"/>
  <rect width="${ANCHO}" height="${ALTO}" fill="url(#reticula)"/>
  <rect x="0.5" y="0.5" width="${ANCHO - 1}" height="${ALTO - 1}" fill="none" stroke="${c.borde}" stroke-width="1"/>

  <text x="${margen}" y="140" font-family="${FUENTE}" font-size="24" font-weight="600"
        letter-spacing="4.8" fill="${c.tenue}">${escapar(antetitulo.toUpperCase())}</text>

  <text font-family="${FUENTE}" font-size="${tamTitular}" font-weight="700" fill="${c.texto}">${lineas}</text>

  <line x1="${margen}" y1="${yRegla}" x2="${margen + 168}" y2="${yRegla}" stroke="${c.texto}" stroke-width="3"/>

  <text x="${margen}" y="${yRegla + 58}" font-family="${FUENTE}" font-size="30" fill="${c.secundario}">${escapar(pie)}</text>

  <text x="${ANCHO - margen}" y="${ALTO - 56}" text-anchor="end" font-family="${FUENTE}"
        font-size="24" font-weight="600" fill="${c.tenue}">antoniocanada.com</text>
</svg>`;
}

const paginas = [
  {
    archivo: "erpnext",
    antetitulo: "Por qué ERPNext",
    titular: ["ERPNext es el Linux", "de los ERP"],
    pie: "Código abierto · licencia GPL · en producción desde 2010",
  },
];

function comprobarFuente() {
  try {
    const familias = execFileSync("fc-list", [":", "family"], {
      encoding: "utf8",
    });
    if (!/\bRoboto\b/.test(familias)) {
      console.error(
        "✗ Roboto no está instalada: el texto se rasterizaría con otra fuente.\n" +
          "  Instálala (p. ej. `apt install fonts-roboto`) o cambia FUENTE en este script.",
      );
      process.exit(1);
    }
  } catch {
    console.warn(
      "⚠ No se pudo comprobar las fuentes con fc-list; sigo, pero revisa el resultado.",
    );
  }
}

comprobarFuente();
mkdirSync(salida, { recursive: true });

for (const p of paginas) {
  const svg = tarjeta(p);
  const destinoSvg = join(salida, `${p.archivo}.svg`);
  const destinoPng = join(salida, `${p.archivo}.png`);
  writeFileSync(destinoSvg, svg);
  const info = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(destinoPng);
  console.log(
    `✓ ${p.archivo}.png — ${info.width}×${info.height}, ${(info.size / 1024).toFixed(0)} KB`,
  );
}
