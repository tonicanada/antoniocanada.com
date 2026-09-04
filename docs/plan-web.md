# Plan de reorganización de la web

## Fase 0 — Medición y fugas

Origen: informes de `bzm-analytics` (`insights/antoniocanada-2026-09-02.md`).
Objetivo: dejar de contar el mismo contenido dos veces y empezar a atribuir el
tráfico de YouTube, para que el rediseño posterior se pueda evaluar sobre datos
limpios.

## 1. URL canónica única — HECHO (pendiente de deploy)

Verificado en producción el 2026-09-02 con `curl`:

- `https://www.antoniocanada.com/` devolvía **200**, no redirigía → host duplicado.
- `https://antoniocanada.com/erpnext` devolvía **200** y `/erpnext/` también,
  mientras el `<link rel="canonical">` apuntaba a `/erpnext/` → ruta duplicada.

Cambios aplicados:

- `astro.config.mjs`: `trailingSlash: "ignore"`.
- `vercel.json` (nuevo): `"trailingSlash": true` + redirect 308 de
  `www.antoniocanada.com` al dominio sin `www`.

Por qué no `trailingSlash: "always"` en Astro: en ese modo el adaptador de
Vercel genera los 308 con expresiones regulares, y para las rutas paginadas
(`[...page].astro`) el `Location` sale como `/erpnext/$1/` con el grupo vacío
— riesgo de doble barra justo en la URL canónica. El propio adaptador avisa de
`ERR_TOO_MANY_REDIRECTS` y recomienda `"ignore"`. La canonicalización nativa de
Vercel no usa regex y se aplica igual a todas las rutas.

**Verificar tras el deploy** (no se puede comprobar antes):

```bash
curl -sS -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://antoniocanada.com/erpnext
curl -sS -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://www.antoniocanada.com/
```

Ambos deben devolver 308 hacia `https://antoniocanada.com/erpnext/` y
`https://antoniocanada.com/` respectivamente.

## 2. Tráfico bot — NO se arregla desde GA4

⚠️ Corrección: la opción *"Excluir todos los hits de bots y arañas conocidos"*
que recomendaba `insights/antoniocanada-2026-08-24.md` era de **Universal
Analytics**. En GA4 no existe: el filtrado de bots conocidos está siempre
activo, no se puede configurar ni desactivar, y no se puede ver cuánto filtró.
Se basa en la lista de bots del IAB.
Ver https://support.google.com/analytics/answer/9888366

Consecuencia: el tráfico de Singapur/EE. UU. está pasando *a pesar* de ese
filtro, porque no figura en esa lista. No hay casilla que marcar.

Opciones reales:

- **Cortarlo en el borde**: reglas del Firewall del proyecto en Vercel. Es la
  única vía que evita que llegue a contarse.
- **Descontarlo al leer**: es lo que ya hace el análisis a mano cuando separa
  Singapur (44/77 y 23/50 sesiones, duración media 1,4–2,1 s, bounce >95%) del
  tráfico real. Sirve para interpretar, no limpia el dato.

Nota: los "Data filters" de GA4 sólo cubren tráfico interno y de desarrollador
por IP, así que no sirven contra bots con IP variable.

## 3. UTMs desde YouTube — acción manual

Es la palanca más grande y más barata según los informes: el canal genera 689
vistas y 2.245 minutos al mes, y sólo **10 sesiones** se atribuyen a Organic
Video (≈1,5% de transferencia).

Enlace fijo y visible en cada vídeo, **arriba en la descripción** (no al
final) y también como **comentario fijado**, apuntando a la página del tema del
vídeo y no a la home. Cubre 580 de las 689 vistas del periodo.

Cada bloque de abajo es para copiar y pegar tal cual: frase + enlace. **La
frase importa**: un enlace desnudo convierte peor, y el texto tiene que
coincidir con lo que la página ofrece de verdad. El vídeo del bootcamp decía
"Reserva tu plaza aquí" y la página dice "Edición 2025 finalizada" + grabaciones
— eso pierde a la persona justo al llegar.

Orden de prioridad: la serie "Contabilidad Fácil" suma **207 vistas**, más que
el bootcamp (163). Es el mayor bloque de audiencia del canal y tiene una página
de curso que le encaja, así que es por donde conviene empezar. Los cuatro van a
la misma página con `utm_content` distinto, para poder leer la serie agregada
(`utm_campaign`) y también qué clase concreta trae gente (`utm_content`).

### Bootcamp ERPNext 2025 — 163 vistas — ✅ HECHO

> Es un **Short**: la descripción casi no se ve (hay que tocar el título
> para desplegarla) y no hay pantalla final ni tarjetas. Aquí el comentario
> fijado es el canal principal, no un extra.

```
👉 Grabaciones del bootcamp y lista de espera para la próxima edición:
https://antoniocanada.com/courses/bootcamp-erpnext-edicion-2025/?utm_source=youtube&utm_medium=video&utm_campaign=bootcamp-erpnext
```

### Contabilidad Fácil — Clase 4 Parte 1 — 97 vistas

> Vídeo largo: además de la descripción tienes **Pantalla final** y
> **Tarjetas** en el menú derecho de Studio. La pantalla final en los
> últimos 20 segundos es la que mejor funciona.

```
👉 Curso completo de contabilidad aplicada a ERPNext:
https://antoniocanada.com/courses/curso-de-contabilidad-basica-aplicada-a-erpnext/?utm_source=youtube&utm_medium=video&utm_campaign=contabilidad-erpnext&utm_content=clase4-p1
```

### Contabilidad Fácil — Clase 4 Parte 2 — 43 vistas

> Vídeo largo: además de la descripción tienes **Pantalla final** y
> **Tarjetas** en el menú derecho de Studio. La pantalla final en los
> últimos 20 segundos es la que mejor funciona.

```
👉 Curso completo de contabilidad aplicada a ERPNext:
https://antoniocanada.com/courses/curso-de-contabilidad-basica-aplicada-a-erpnext/?utm_source=youtube&utm_medium=video&utm_campaign=contabilidad-erpnext&utm_content=clase4-p2
```

### Contabilidad Fácil — Introducción — 38 vistas

> Vídeo largo: además de la descripción tienes **Pantalla final** y
> **Tarjetas** en el menú derecho de Studio. La pantalla final en los
> últimos 20 segundos es la que mejor funciona.

```
👉 Curso completo de contabilidad aplicada a ERPNext, desde cero:
https://antoniocanada.com/courses/curso-de-contabilidad-basica-aplicada-a-erpnext/?utm_source=youtube&utm_medium=video&utm_campaign=contabilidad-erpnext&utm_content=introduccion
```

### Contabilidad Fácil — Clase 1 — 29 vistas

> Vídeo largo: además de la descripción tienes **Pantalla final** y
> **Tarjetas** en el menú derecho de Studio. La pantalla final en los
> últimos 20 segundos es la que mejor funciona.

```
👉 Curso completo de contabilidad aplicada a ERPNext:
https://antoniocanada.com/courses/curso-de-contabilidad-basica-aplicada-a-erpnext/?utm_source=youtube&utm_medium=video&utm_campaign=contabilidad-erpnext&utm_content=clase1
```

### Veri*Factu en ERPNext (demo AEAT) — 58 vistas

> Vídeo largo: además de la descripción tienes **Pantalla final** y
> **Tarjetas** en el menú derecho de Studio. La pantalla final en los
> últimos 20 segundos es la que mejor funciona.

```
👉 ERPNext listo para facturar en España con Veri*Factu:
https://antoniocanada.com/services/pack-espana-verifactu/?utm_source=youtube&utm_medium=video&utm_campaign=verifactu
```

### ERPNext en Windows con Docker y WSL2 — 58 vistas

> Vídeo largo: además de la descripción tienes **Pantalla final** y
> **Tarjetas** en el menú derecho de Studio. La pantalla final en los
> últimos 20 segundos es la que mejor funciona.

```
👉 Capacitación técnica en ERPNext y Frappe:
https://antoniocanada.com/services/capacitacion-tecnica-erpnext/?utm_source=youtube&utm_medium=video&utm_campaign=capacitacion-tecnica&utm_content=docker-wsl2
```

### ERPNext en Mac y Linux con Docker — 34 vistas

> Vídeo largo: además de la descripción tienes **Pantalla final** y
> **Tarjetas** en el menú derecho de Studio. La pantalla final en los
> últimos 20 segundos es la que mejor funciona.

```
👉 Capacitación técnica en ERPNext y Frappe:
https://antoniocanada.com/services/capacitacion-tecnica-erpnext/?utm_source=youtube&utm_medium=video&utm_campaign=capacitacion-tecnica&utm_content=docker-mac-linux
```

### Ecommerce con ERPNext: Stripe, factura, inventario — 31 vistas

> Vídeo largo: además de la descripción tienes **Pantalla final** y
> **Tarjetas** en el menú derecho de Studio. La pantalla final en los
> últimos 20 segundos es la que mejor funciona.

```
👉 Automatizar e integrar ERPNext con tus herramientas:
https://antoniocanada.com/services/automatizacion-erpnext/?utm_source=youtube&utm_medium=video&utm_campaign=ecommerce-erpnext
```

### ERPNext + Fintoc: conciliación en Chile — 29 vistas

> Vídeo largo: además de la descripción tienes **Pantalla final** y
> **Tarjetas** en el menú derecho de Studio. La pantalla final en los
> últimos 20 segundos es la que mejor funciona.

```
👉 Cómo funciona la conciliación bancaria automática:
https://antoniocanada.com/integraciones/banco/?utm_source=youtube&utm_medium=video&utm_campaign=fintoc
```

Las diez páginas destino verificadas con `curl` contra producción: todas 200.

✅ **Resuelto en Fase 2.** La URL del vídeo de Fintoc es ya la definitiva
(`/integraciones/banco/`) y los 301 desde `/projects/*` están puestos, así que
el enlace funciona por las dos vías.

## 4. Enlace roto en el vídeo más visto — HECHO

La descripción del vídeo del Bootcamp (163 vistas/mes, el más visto del canal)
apuntaba a `/courses/bootcamp-erpnext-proxima-edicion-2025`, que devuelve
**404**. Explica parte del agujero de 689 vistas → 10 sesiones: quien hacía
clic se encontraba un error.

Causa: las URLs se generan desde el título (`GENERATE_SLUG_FROM_TITLE = true`,
`src/lib/createSlug.ts`) e ignoran el nombre del archivo. El título pasó de
"Bootcamp ERPNext – **Próxima** Edición 2025" a "Bootcamp ERPNext – Edición
2025" y la URL se movió sola, sin aviso.

Aplicado:

- 301 en `vercel.json` de la URL vieja a `/courses/bootcamp-erpnext-edicion-2025/`,
  para recuperar a quien llegue por el enlace antiguo (sigue circulando).
- `urlSlug` opcional en el frontmatter (`src/content/config.ts` + `createSlug`):
  cuando está presente fija la URL y el título se puede editar libremente. Ya
  puesto en el curso del bootcamp y en el proyecto de Fintoc, los dos con
  enlaces externos apuntando a ellos.

Verificado: build de 117 páginas y **ninguna URL cambió** respecto al build
anterior (diff de la lista completa de rutas generadas).

Pendiente si interesa: fijar `urlSlug` en el resto del contenido antes de la
Fase 2, para que mover URLs sea una decisión y no un efecto secundario.

---

## Fase 1 — Home y mensaje

## Titulares: uno por página, no rotación

Se descartó rotar titulares al azar (test A/B): con 233 sesiones y 17
`service_cta_click` al mes, cada variante recibiría ~116 sesiones y ~8 clics,
y la diferencia entre 8 y 11 clics es indistinguible del azar. Harían falta del
orden de un año para una lectura fiable, y en ese año la web habrá cambiado
muchas veces. Es el mismo aviso que abre el informe del 2026-09-02: por debajo
de ~100-300 sesiones las variaciones porcentuales no son señal.

Además el sitio es estático: rotar en el navegador provoca parpadeo y Google
indexa solo la variante que esté en el HTML.

En su lugar, **segmentación por intención**: cada página lleva el titular que
corresponde a con qué llega el visitante. Las frases quedan asignadas:

| Página | Titular | Estado |
|---|---|---|
| Home | **Antes de poner IA en tu empresa, ponla en un solo sistema** | ✅ puesto |
| `/erpnext` | **El Excel que pega tus sistemas es tu sistema más crítico** | reservado (Fase 2) |
| `/services` | **ERPNext, desde la implementación hasta la IA** | ✅ puesto (Fase 3) |
| `/chile` | ángulo fiscal local (SII, DTE, RCV, F29) | reservado (Fase 3) |
| `/espana` | ángulo fiscal local (Veri*Factu, AEAT) | reservado (Fase 3) |

Descartadas por ahora, pero disponibles: "Seis sistemas, seis versiones de la
verdad", "Tu contabilidad no sabe lo que sabe tu inventario", "Ninguno de tus
sistemas puede responder tu pregunta más importante".

Cuando el tráfico de YouTube esté encauzado, el paso siguiente no es un A/B
sino **páginas de destino por campaña**: quien llega del vídeo de Fintoc viene
pensando en conciliación bancaria y quien llega de Contabilidad Fácil en cierre
contable. Coherencia, no significancia estadística.

## Por qué el titular cubre dos segmentos

Hay dos perfiles y la primera versión del titular ("Si tus sistemas no tienen
API, la IA no puede hacer nada por ti") expulsaba al mejor:

- **A** — sistemas de escritorio sin API. No pueden automatizar nada. Historia
  más dramática, pero cliente más difícil: resiste el cambio, menos
  presupuesto, migración más dolorosa.
- **B** — un SaaS moderno para cada cosa, todos con API. Mercado más grande y
  cliente mejor: ya paga software y entiende el valor.

Lo que comparten: ninguno tiene una sola fuente de verdad. A porque no hay API,
B porque hay seis silos. El titular actual pregunta en cuántos sitios están tus
datos, no si tienes API, así que los dos se reconocen. El subtítulo los nombra
explícitamente para que cada uno se identifique en los primeros segundos.

## El esquema: tres capas, no una cadena

La primera versión era `ERPNext → SII → Banco → IA`, y tenía dos fallos:

1. **Se leía como secuencia**: sugería que el banco viene después del fisco, un
   orden que no significa nada.
2. **Ponía la IA como par del SII y del banco.** El fisco y el banco son
   fuentes de datos; la IA es lo que se pone encima. En fila se aplana justo la
   parte más diferencial.

Ahora son tres capas: fuentes abajo, ERPNext en el centro, IA arriba vía MCP.
Se lee en dos o tres segundos igual que la cadena, dice que el ERP es el centro
y no un eslabón, y **admite crecer** — se añade una fuente abajo sin rediseñar
nada.

Tras verlo renderizado hubo una segunda pasada, por tres problemas reales:

1. **ERPNext en negro pleno competía con el CTA.** "Agendar llamada" también es
   negro, así que el bloque más contrastado de la pantalla era una caja de un
   diagrama en vez del botón. En una página cuyo trabajo es un clic, el negro
   pleno se reserva a ese clic. La jerarquía la dan ahora el grosor de borde y
   el cuerpo de letra.
2. **El orden de lectura peleaba con las flechas**: se lee de arriba abajo y
   las flechas apuntaban arriba. Se quitaron; lo dice la posición — las cuatro
   fuentes van dentro de la caja de ERPNext (la alimentan) y la IA va separada
   por aire arriba (consulta encima).
3. **Las capas de arriba y de abajo eran idénticas en estilo** (blanco, borde
   fino), perdiendo justo la distinción que motivó abandonar la cadena.

De paso el esquema perdió altura, que le sobraba: ocupaba casi un tercio del
hero para decir algo que el subtítulo ya adelanta.

**Tercera pasada: el esquema se sacó del hero.** Ni con el negro quitado
funcionaba, y el motivo es estructural, no de estilo: en el hero el esquema
tiene que ser pequeño y discreto para no competir con el botón de agendar, y un
esquema pequeño y discreto no sostiene un argumento. Por eso fallaron los tres
intentos.

Ahora vive en la segunda pantalla (`EsquemaFlujo.astro`), antes de casos
reales, con espacio para ser explícito. Y **la pila va invertida**: fuentes
arriba, ERPNext en medio, IA al final. Así el flujo de datos, el orden de
lectura y las flechas apuntan todos hacia abajo — se recuperan las flechas sin
la contradicción de antes — y el remate cae en la IA, que es la mejor carta, en
vez de quedar como pie de foto.

Las flechas van **etiquetadas** ("entran sin digitar nada, desde el organismo y
desde el banco" / "preguntas en lenguaje natural, vía MCP"), que es lo que hace
que un diagrama explique en vez de decorar. En el hero no había sitio para eso.

La caja de la IA cierra con una pregunta de ejemplo real («¿Cuánto llevamos
gastado en esta obra y qué falta por facturar?») en vez de una descripción
abstracta: es la que un jefe de obra hace de verdad y hoy no puede responder
nadie.

El hero queda con titular, subtítulo y dos botones. El argumento sigue estando
en palabras en el subtítulo, y el esquema está a un scroll con el indicador ↓
justo debajo.

**Cuarta pasada, tras verlo renderizado:**

- **La pila se invirtió otra vez: la IA arriba.** Es donde el visitante
  interactúa —él es quien va a hacer la pregunta— así que el recorrido arranca
  ahí y baja explicando qué lo hace posible: "preguntas aquí → lo responde esto
  → que se llena solo con estas fuentes". Se pierde el remate final pero se gana
  el gancho al principio, que vale más. Las flechas siguen acompañando al orden
  de lectura. El H2 cambió a "Preguntas en tu idioma. Responde tu empresa." para
  ser coherente con ese orden.
- **La figura estaba descuadrada**: el bloque de texto es `max-w-3xl` y la
  figura era `max-w-2xl`, las dos alineadas a la izquierda, así que el borde
  derecho quedaba ragged. Ahora las dos al mismo ancho y los bordes coinciden.
- **Fuera el borde de 2px de ERPNext.** Se puso para dar jerarquía en el hero
  cuando no se podía usar negro; aquí la posición central y el cuerpo de letra
  ya la dan, y un borde grueso en una caja de tres parece un descuido. Se
  distingue por relleno (`bg-gray-100`), que es más limpio que por grosor.
- **El esquema tiene pantalla propia** (`#contenido`), separado de casos reales
  (`#mas`). Compartiendo scroll se leía todo apelotonado. La home pasa de dos a
  tres secciones con snap: hero → esquema → casos reales + contenido + footer.

**Las cajas se etiquetan por función, no por organismo.** "SII" no es que un
español no lo entienda: le dice que esto es de otro país. La caja dice
"Facturación electrónica" y debajo `SII · AEAT · SUNAT · SAT`, que además
transmite conocimiento multipaís. El detalle de cada organismo vive en su
landing de país. Los proveedores concretos (Fintoc, Wherex) no aparecen en el
hero por la misma razón.

**No se amplía el esquema con más conexiones** aunque se pueda: con diez cajas
deja de ser un argumento y pasa a ser un catálogo, el lector compara su lista
contra la tuya y si lo suyo no está concluye que no lo haces. El catálogo
completo va en `/integraciones` (Fase 2), donde el lector ya compró la premisa.

## Otros cambios en la home

- Biografía de cuatro párrafos a una línea, y al final en vez de al principio.
  Matemáticas y ciencia salen del hero.
- Tres botones que competían pasan a dos, con jerarquía (negro = agendar).
- La segunda pantalla deja de ser un volcado de 9 tarjetas (3 proyectos, 3
  cursos, 3 posts incluidos los personales). Ahora: casos reales, las guías de
  ERPNext que ayudan a decidir, y una banda de CTA. Cursos y blog quedan en una
  línea al final: accesibles pero fuera del camino comercial.
- `SITE_TITLE` y `SITE_DESCRIPTION` reescritos (55 y 154 caracteres, dentro de
  lo que Google muestra). Eran genéricos y el informe marcaba 66 impresiones de
  búsquedas de marca con **cero clics**.
- Los cuatro CTA de la home instrumentados con `service_cta_click` y
  `cta_location` (`home_hero`, `home_banda_cta`), siguiendo la convención de
  `ProductCard`. Ojo: el sitio usa `data-ev`/`data-ev-params`, no `data-cta`.
  **No se tocó `booking_start`**, que hoy sólo lo dispara `gracias.astro` y
  significa "hizo clic en el calendario real": conviene dejarlo limpio para
  comparar con los informes anteriores.

## Pendiente de Fase 1

- El botón secundario de la banda dice "Ver servicios" y no "Ver servicios y
  precios" porque en `/services` todavía no hay precios. Cambiarlo al montar el
  modelo por componentes (Fase 3).

## Quinta pasada: segunda fila de conexiones

Con pantalla propia y el tercio inferior vacío, la objeción original (más cajas
= catálogo en vez de argumento) ya no aplica. Pero la segunda fila tiene que
ser **otra categoría**, no más de lo mismo: la primera fila no es
"integraciones", es *datos que entran solos*, y ocho cajas bajo la misma
etiqueta volverían a leerse como lista.

- **Fila 1 — de dónde viene la verdad**: facturación electrónica, banco,
  compras, remuneraciones. Datos fiscales y financieros que tienen que ser
  autoritativos. Etiqueta: "se alimenta solo, sin digitar nada".
- **Fila 2 — dónde opera la empresa**: WhatsApp, ecommerce, pagos, documentos.
  Canales por los que la empresa actúa hacia fuera. Etiqueta: "y opera hacia
  fuera desde el mismo sitio". Visualmente un peldaño más suave (borde y fondo
  más claros) para que la jerarquía entre filas se lea.

**Sólo entra lo que tiene trabajo real detrás**: el chatbot de WhatsApp, el
vídeo de ecommerce con Stripe y factura, y el flujo de XML por correo y Drive.
Descartadas por falta de evidencia pública: firma electrónica y BI. Descartadas
por alejar del mensaje: marketplaces y apps de terreno. Nunca "Excel" (contradice
el titular) ni "APIs" (no dice nada).

**Nombres de marca: sólo los globales.** WhatsApp, Shopify y Stripe los reconoce
cualquiera; Fintoc y Wherex no, y ponerlos repite el problema de "SII" — le dicen
a un mexicano que esto es de otro país. Esos van en su página de integración.

**Ocho cajas es el techo.** Dos filas de cuatro es el límite de lo que se lee de
un vistazo. Una novena caja ya no es esquema: es `/integraciones`.

### Enlace de salida

Se añadió **"Ver todas las integraciones →"** al final del esquema. Resuelve el
riesgo de fondo: el lector que no ve su herramienta entre las ocho cajas
concluye que no la haces. Con la salida hace clic en vez de irse. Y le da a la
home un enlace interno hacia la página comercial, que hoy no tiene.

✅ **Resuelto en Fase 2**: ya apunta a `/integraciones/`.

## Estructura de la home: una sección por pantalla — SUPERADO

> Ver *"Sexta pasada"* más abajo: la home pasó de cuatro secciones a tres y
> dejó de atar la altura a la pantalla. Lo que sigue queda como registro.


La home pasa de 2 secciones con snap a **4**: `#hero` → `#contenido` (esquema)
→ `#casos` (casos reales) → `#decidir` (guías + banda de CTA + pie).

Antes, casos reales y el resto del contenido compartían una sección
`lg:h-screen lg:overflow-y-auto`, y eso dejaba un hueco blanco grande al final:
con altura fija, el contenido que no cabe genera un scroll interno que pelea con
el scroll-snap del contenedor padre.

Se usa **`min-h-screen`, no `h-screen`**, en todas: el contenido corto llena la
pantalla y el largo crece sin romper el snap ni provocar scroll anidado. En la
última sección el contenido va centrado con `flex-1` y el pie queda abajo, en
vez de flotar en medio del hueco que sobra.

## Sexta pasada: la home se acorta a tres secciones

Cuatro secciones eran demasiadas, y una de ellas duplicaba una página entera.

**Fuera `#casos`.** Montaba `ReferencesSection` con `showCta={false}`, y
`/casos-reales` monta el mismo componente con `showHeader={false}`: el mismo
contenido en dos URLs. Es exactamente lo que la Fase 0 vino a arreglar —"dejar
de contar el mismo contenido dos veces"— sólo que allí se buscó en el host y en
la barra final, y esto se quedó dentro de la propia home.

En su lugar, una línea: "Tecton ordenó finanzas y procesos, Hostname salió de
Odoo, Vegostart formó a su equipo. **Ver los tres casos**". Las tres frases
salen de `src/data/references.ts`, no las inventa nadie. Da credibilidad de
paso —que es lo que hace la prueba social en una landing— sin gastar una
pantalla ni competir con la página que existe.

**Fuera el bloque de guías** que abría `#decidir` con el epígrafe "Antes de
decidir". Dos razones: la colección `erpnext` tiene dos entradas y el
`.slice(0, 3)` prometía una tercera que no existe, y `/erpnext` está en el menú.
Media pantalla para repetir un enlace que ya estaba a un clic.

**`#decidir` pasa a `#hablamos`.** El id describía las guías; ahora la sección
es la petición de llamada y se llama por lo que hace. Nada enlazaba a los
anclajes viejos (verificado en `src/`, `docs/` y `vercel.json`).

Queda: `#hero` → `#contenido` (esquema) → `#hablamos` (prueba + banda de CTA +
pie). De 4,40 pantallas a **2,84** en 1440×813, y 3,25 en móvil.

### Qué se consideró y no se hizo

**Sacar el esquema a una página propia** tipo `/como-funciona`. Descartado por
tres razones. La primera es que ya se probó al revés: las pasadas 1 a 3 de este
documento concluyeron que el esquema no funciona cuando no tiene sitio para ser
explícito, y ponerlo a un clic es la versión extrema del mismo error. La segunda
es que es el único activo que no tiene la competencia, y un director de
administración decide si esto es distinto en la primera pantalla y media, no
después de hacer clic en un ítem de menú. La tercera es el volumen: con 233
sesiones al mes, partir la home somete a cada página nueva al mismo suelo de
medición que hizo descartar el A/B —por debajo de 100-300 sesiones las
variaciones no son señal—. Concentrar tráfico vale más que segmentarlo.

Si en algún momento el mecanismo merece desarrollo propio, la página ya existe:
`/erpnext`, que tiene reservado "El Excel que pega tus sistemas es tu sistema
más crítico" y es el mismo argumento con otras palabras. El botón secundario del
hero ("Ver cómo funciona") ya apunta ahí. Eso es progresión, no fragmentación, y
no suma un décimo ítem al menú.

**Lo que decidiría esto con datos y no por criterio**: la profundidad de scroll
en la home. Si menos de una cuarta parte llegaba a `#casos`, el argumento del
relato único estaba muerto empíricamente. La instrumentación de la Fase 0 puede
responderlo; conviene mirarlo antes de mover más contenido entre páginas.

## Estructura de scroll: se abandona el snap

La home scrolleaba dentro de un `<main>` con `overflow-y-auto` y
`lg:snap-mandatory`. Costes reales, no teóricos:

- El navegador sólo restaura la posición del **documento**, no la de un
  contenedor: volver atrás desde el blog dejaba la home arriba.
- Un enlace a `/#casos` desde otra página no saltaba, por lo mismo.
- El snap era `lg:` solamente, así que en móvil nunca existió. Y en desktop
  sujetaba menos de lo que parecía: medidas las cuatro secciones, tres eran más
  altas que la ventana de un portátil, así que no alineaba pantallas — peleaba
  con el scroll interno del contenido que no cabía.

El scroll pasa al documento, con lo que se arreglan los tres puntos de arriba.
Y tras probar las tres variantes de snap —`mandatory`, sin snap, y `proximity`—
**se abandona el snap por completo**. El patrón fue el mismo en las tres: cada
vez que se le pide al layout que garantice pantallas completas, aparece una
ventana donde no puede.

Los números que lo cierran:

- El contenido del esquema mide **651 px**. El alto útil en un portátil de
  768 px de pantalla ronda los 640. En esa ventana no cabe ni quitándole todo el
  padding, así que "una sección, una pantalla" no es una promesa cumplible.
- La home mide **2,7 pantallas**. Con dos puntos de anclaje y el segundo a menos
  de una ventana del final, alguna vista salía parcial por aritmética.

Y alinear *a medias* es exactamente lo que se leía como error: dejaba la última
caja del esquema cortada por 30 px. Sin promesa de alineación no hay nada que
incumplir.

Descartado también **snap sólo en el hero**: con un único punto de anclaje en el
0 y `proximity`, empezar a bajar despacio y parar a 200 px te devuelve arriba de
un tirón. Peor que no tener snap.

El hero conserva la pantalla completa, que es decisión de landing y no de
mecánica de scroll: no depende de que nada encaje después.

**El padding de las secciones baja a `lg:py-16`.** Con los 96 px de `lg:py-24`
la sección del esquema se iba a 843 px y se pasaba de una ventana de 813 por
30 px — el corte que se veía. Con 64 px se queda en **779** y entra con holgura:
verificado en 1440×900 (813 útiles) y 1920×1080 (993). En 1440×768 (681 útiles)
no cabe, y ya no importa.

`scroll-pt-16` descuenta el navbar sticky de 4rem de móvil, que hasta ahora
tapaba la cabecera de la sección a la que saltabas —tanto con el snap como con
la flecha ↓—. En `lg` no hay barra y el descuento se anula. Verificado: 64 px a
500 px de ancho, 0 px a 1440.

Las secciones dejan de usar `lg:min-h-screen` (salvo el hero, que sí quiere la
pantalla completa) y pasan a padding fijo: con el alto atado a la ventana el
ritmo cambiaba según la pantalla, largo en un portátil y con aire de sobra en un
monitor grande.

`BaseLayout` gana una prop `htmlClass`, porque `scroll-snap-type` y
`scroll-padding` tienen que ir en el contenedor de scroll —el `<html>`— y ese
elemento lo controla el layout. Sólo la home la usa.

## Dos ajustes de copy tras revisar la home renderizada

### El subtítulo se leía como oferta, no como problema

Arrancaba con un sustantivo sin verbo ("Un sistema para facturar, otro para
remuneraciones, otro para el banco"), y en una landing la línea bajo el titular
es por convención donde dices qué haces. Quien escaneaba la primera línea podía
leerla como el catálogo de servicios — y peor, **esas tres cosas sí se ofrecen**,
así que la mala lectura aterrizaba en algo verosímil y el lector no volvía atrás.
La aclaración llegaba al final de un párrafo de tres líneas, donde mucha gente no
llega. El titular tampoco protegía: es una instrucción, no un diagnóstico.

Arreglo: **"Hoy tienes un sistema para facturar…"**. La marca temporal implica un
después, y la segunda persona lo hace suyo. Descartado "Tienes" a secas: sin
"hoy" reintroduce el problema por otra vía — puede leerse como *lo que tendrás
conmigo*, módulos que se entregan.

Alternativas evaluadas y no elegidas, por si se retoma: "Arrastras…" (el verbo
aporta persona y carga negativa a la vez, pero es más literario que el resto de
la web), "Te suena:…" (máximo reconocimiento, registro coloquial), "El punto de
partida habitual:…", y una etiqueta tipográfica `EL PROBLEMA` sobre la frase
—cero riesgo interpretativo y permitiría un `LA SALIDA` sobre el esquema, pero
es el recurso más visto en landings y la página tiene hoy un tono más sobrio.

### La caja de IA no lista más marcas

Verificado el 2026-09: Claude tiene soporte MCP de primera clase y ChatGPT lo
tiene vía Modo Desarrollador (desde finales de 2025); también Cursor, Windsurf y
VS Code con GitHub Copilot. Sin soporte o mínimo: Gemini, Microsoft Copilot de
consumo y Perplexity. **De Grok no hay constancia de soporte MCP.**

Por eso no se nombran Grok ni Copilot:

- Grok sería una afirmación no verificable, del tipo que un lector técnico
  comprueba en dos minutos.
- "Copilot" es ambiguo y engañoso para este público: GitHub Copilot en VS Code
  sí lo soporta, pero el de Microsoft 365 no — y un director de administración
  piensa en el segundo.

La caja dice **"IA — Claude, ChatGPT y cualquier asistente compatible"**, y la
flecha ("vía MCP") define qué significa compatible. No caduca, no promete lo que
no se cumple, y "cualquiera compatible" es un argumento comercial más fuerte que
cuatro nombres: MCP es estándar abierto, no hay atadura de proveedor — lo
contrario de lo que le pasa al lector con el software que tiene hoy.

---

# Fase 2 — Muere /projects, nace /integraciones

`/projects` no contenía proyectos, contenía productos: cuatro integraciones que
se venden. Los proyectos personales (oloide, three.js, TSP) ya vivían en el
blog, así que la sección entera se reconvierte.

## Mapa de URLs

| Antes | Ahora |
|---|---|
| `/projects/` | `/integraciones/` |
| `/projects/integracion-de-erpnext-con-el-sii-de-chile/` | `/integraciones/sii-chile/` |
| `/projects/erpnext-fintoc-conciliacion-bancaria-automatica/` | `/integraciones/banco/` |
| `/projects/integracion-de-erpnext-con-wherex/` | `/integraciones/sourcing/` |
| `/projects/chatbot-de-whatsapp-conectado-a-erpnext/` | `/integraciones/mcp-ia/` |
| `/rss-projects.xml` | `/rss-integraciones.xml` |

Las cuatro páginas llevan `urlSlug` fijo, así que los títulos se pueden reescribir
sin mover las URLs — que es exactamente el fallo que rompió el enlace del
bootcamp en YouTube.

Se renombró también `public/assets/images/projects/` a `.../integraciones/` para
que la ruta no mienta, y la colección `projects` pasó a `integraciones` (esquema,
rutas, RSS, página de tags y menú).

### Los 301, escritos en las dos formas

Cada redirect existe con y sin barra final. **No está verificado si Vercel
aplica los redirects antes o después de normalizar la barra con
`trailingSlash: true`**, y adivinarlo mal significa que los 301 no capturan
nada. Con las dos formas acierta en cualquier orden, y ningún destino coincide
con un `source`, así que no hay bucle posible. Verificado: 14 reglas, cero
bucles.

## Reencuadre de contenido

- **`sii-chile`** — reescrita entera. La anterior explicaba el repo
  `erpnext_chile_factura` (ingreso de XML por correo y Drive). Ahora cubre el
  ciclo completo desde el orquestador: emisión de DTE con folios CAF, envío,
  consulta de estado, PDF con timbre carta y cedible, RCV, lectura de casilla,
  aceptación/reclamo, boletas de honorarios y multiempresa.
- **`banco`** y **`sourcing`** — mismo cuerpo, encuadre nuevo: capa genérica
  (banca, sourcing) más el proveedor de cada país (Fintoc, Wherex en Chile). Es
  lo que permite vender lo mismo en México o Perú sin reescribir el sistema.
- **`mcp-ia`** — sustituye al chatbot de WhatsApp. El gateway MCP hacia dentro
  (Claude, ChatGPT o cualquier asistente compatible, con los permisos de
  ERPNext) y WhatsApp/Telegram hacia fuera como canal, no como producto.
- **`/integraciones`** deja de ser un listado pelado: lleva introducción, explica
  el patrón de dos capas y una salida a agendar para quien no vea su
  herramienta.

## Qué se puede afirmar y qué no

La emisión de venta está **validada contra el ambiente de certificación del
SII** y en despliegue; la parte de compras **corre en producción**. La página
describe la capacidad en presente y sin disclaimers —está construida y
funciona— pero **no afirma historial que no existe**: nada de "N empresas
emiten con esto" ni volúmenes de facturas.

La distinción no es cosmética: se vende cumplimiento tributario, y un DTE
fallido en Chile no es un bug, es un problema legal. Si un cliente firma
creyendo que la emisión está curtida en producción, el problema aparece en el
primer cierre de mes.

Y la precisión vende: "compras en producción; emisión validada en certificación"
suena a alguien que distingue maullin de palena — que es la pericia que se está
vendiendo. El historial real que sí existe está en la página porque es fuerte:
cuatro empresas en producción en compras, 132 tests unitarios donde no había
ninguno, y el clasificador de correo validado contra 120 XML reales del SII.

**No se publica infraestructura interna**: nada de hosts, códigos de sitio,
dominios de desarrollo ni número total de sitios del bench.

## Verificado

- Build de 118 páginas, y **cero enlaces roto** en todo el sitio (barrido de
  todos los `href` internos de todas las páginas contra los ficheros generados).
- Cero referencias a `/projects` en el HTML generado.

## Pendiente tras el deploy

Comprobar que los 301 capturan las URLs viejas en sus dos formas:

```bash
for u in /projects/ /projects/integracion-de-erpnext-con-el-sii-de-chile \
         /projects/erpnext-fintoc-conciliacion-bancaria-automatica/ ; do
  curl -sS -o /dev/null -w "%{http_code} %{redirect_url}\n" "https://antoniocanada.com$u"
done
```

## Corrección: el titular de /services

El plan reservaba "Cerrar el mes no debería llevar tres semanas" para
`/services`, y era un error — el mismo que este documento ya había señalado al
descartarla de la home: *encasilla el negocio como problema de contabilidad*.
MCP, inventario, obras, sourcing y ecommerce no pasan por el cierre mensual, así
que la frase recorta la oferta justo en la página cuyo trabajo es comunicar
alcance.

Titular puesto: **"ERPNext, desde la implementación hasta la IA"**. Nombra el
producto (aquí llega quien ya sabe lo que busca, y es donde interesa posicionar
"implementar ERPNext") y dice de dónde a dónde llega la oferta en cuatro
palabras. Se descartó "ERPNext **para tu empresa**, desde…" porque "para tu
empresa" se sobreentiende y ablanda la frase.

Descartada también "Implementa ERPNext. Conéctalo. Automatízalo.": tiene más
ritmo, pero "conéctalo" y "automatízalo" se solapan, y tres imperativos seguidos
suenan a eslogan de agencia — un registro más flojo que el del resto del sitio.

La frase del cierre de mes se conserva en el subtítulo, donde acompaña sin
gobernar.

### Pendiente: primera persona singular o plural

El subtítulo dice "Centralizamos, conectamos, hacemos" y el resto del sitio
habla en singular ("Soy Antonio Cañada", "te lo digo en la misma llamada"). La
página de hosting dice "nuestros servidores". **La web mezcla las dos voces
hoy.** Es una decisión de marca, no de estilo —con Bizmotion en marcha,
"nosotros" puede ser lo correcto— pero hay que elegir una y pasarla por todo el
sitio de una vez.

---

# Precios por país

Los importes viven en las páginas de país, no en `/services`. El motivo no es
sólo la moneda:

**El contenido del componente cambia, no sólo el precio.** "Localización
fiscal" en Chile es SII, DTE, folios CAF y RCV; en España es plan contable y
Veri*Factu. Son trabajos distintos, no el mismo trabajo a otro precio. Y
algunas integraciones existen sólo en un país (Fintoc, Wherex). Si sólo se
cambiara la moneda, la página de España acabaría diciendo "SII, DTE, folios,
RCV" en euros.

**Separar por país elimina la comparación lado a lado.** Si un visitante puede
ver la tabla de Chile junto a la de España, la diferencia de precio por el
mismo componente exige una explicación, y la real (mercados y poder de compra
distintos) es honesta pero incómoda escrita al lado. Es lo que hace cualquiera
con precios regionales, siempre que no se presenten juntos.

**`/services` conserva la tabla sin importes**, con la columna "cómo se cobra"
(fijo, mensual, por presupuesto) y una salida visible a Chile y España. Así
sigue sirviendo a quien está en México, Perú o Bolivia, donde ninguna de las dos
monedas aplica. Los 300 € del blueprint salieron de ahí: eran el único importe
de la página y en moneda extranjera para un lector chileno.

## Cómo rellenar los números

Todo está en `src/data/servicios.ts`, en `componentes[].paises.{cl,es}`. Poner
`precio` en la moneda del país y sin decimales; la tabla lo formatea y aparece
solo en las tres páginas que la usan. Mientras no haya importe se muestra sólo
el modo de cobro — no se ponen cifras de relleno.

Tres criterios al fijarlos:

1. **Lo idéntico entre países es la estructura, no el importe.** Mismos
   componentes y mismos modos de cobro. Si en Chile la migración va por
   presupuesto y en España a precio fijo, eso sí es incoherente.
2. **No convertir con el tipo de cambio, fijar por mercado** — pero cuidando
   las proporciones entre componentes: si el hosting anual es el 10% del
   proyecto en un país y el 40% en el otro, el cliente que compare su
   presupuesto con la tabla lo va a notar.
3. **Redondear a cifras memorables en cada moneda**: 1.500.000 CLP, no lo que
   salga de convertir euros.

## Las dos landings

- **`/chile`** — ataca "erpnext chile" (posición 4,9 con 25 impresiones en
  Search Console, la única consulta con intención comercial que ya posiciona).
  SII en los dos sentidos, contabilidad chilena, banco, licitaciones, UF y
  multiempresa, remuneraciones por centro de costo. Y la sección de
  construcción con lo que ningún ERP estándar trae.
- **`/espana`** — Veri*Factu, contabilidad española, banco, IA por MCP. Dice
  explícitamente que España está en otro momento que Chile: dos demostraciones
  grabadas y un programa de primeras implantaciones, no cuatro empresas en
  producción.

Cuidado con lo que se afirma en `/chile`: el F29, Previred y la UF se mencionan
como lo que son —cosas que la configuración contempla— y **no** como
integraciones automáticas, porque no lo son. Lo que sí está construido y
corriendo es la conexión con el SII.

**No entran en el menú principal**, que ya tiene nueve entradas. Se llega desde
`/services`, desde la página de hosting y desde la otra landing de país; el
tráfico que importa va a llegar por buscador.

---

# Lote previo al despliegue

## Chile se denomina en UF, no en pesos

Publicar en CLP facturando desde España deja el riesgo de tipo de cambio del
lado de quien publica: si el peso se mueve un 8% —que pasa sin ser noticia— o
pierdes margen o tienes que decirle al cliente que el precio subió, y esa
conversación al principio de una relación es cara. La UF es la convención
chilena para exactamente esto y un cliente chileno la entiende sin explicación.

La UF manda contractualmente; el peso es una ayuda de lectura, porque la UF
cuesta más de leer de un vistazo. `src/data/uf.ts` guarda el valor con su fecha
y **está en `null` a propósito**: mientras no haya un valor verificado se
muestra el precio en UF y ninguna referencia en pesos, en vez de una cifra
inventada.

Si algún día se automatiza, "solo" significa recompilación programada — el sitio
es estático. Por eso la fecha se muestra: si la consulta falla, un valor viejo
se ve en vez de pasar desapercibido.

## Cabecera de tabla adaptativa

Una columna titulada "Precio (UF)" con todas las celdas diciendo "Precio fijo"
no se lee como pendiente, se lee como **roto**. Ahora la cabecera dice "Cómo se
cobra" mientras ese país no tenga ningún importe, y pasa sola a "Precio (UF)" o
"Precio (EUR)" en cuanto se ponga el primero. Verificado: Chile muestra "Cómo
se cobra", España "Precio (EUR)" porque ya tiene los 300 € del blueprint.

## El blueprint se descuenta del proyecto

Cobrar el diagnóstico es un buen patrón, pero **es un filtro, y los filtros
sirven cuando hay más demanda que capacidad**. Con 4 llamadas al mes el cuello
de botella es conseguir conversaciones, no filtrarlas, y un peaje de 300 € antes
del proyecto real quita justo lo que falta. Además obligaba a decir sí dos veces.

Ahora se descuenta del presupuesto si se contrata la migración: mantiene la
cualificación intacta y elimina la objeción. Y sigue siendo un entregable que el
cliente se lleva si decide no seguir.

No se añade una demo en vivo como tercera oferta —tres puertas de entrada
convierten peor que una— pero sí conviene **incrustar la demo grabada en las
páginas**, como ya hace el pack de España con sus dos vídeos. La página del SII
no tiene vídeo y debería tenerlo: es la integración más fuerte y hoy se explica
sólo con texto.

## Voz: singular

Decidido singular por defecto, plural sólo donde la empresa es literalmente
quien actúa ("nuestros servidores", el soporte, la sociedad que factura).

Razones: es verdad —hoy el trabajo lo hace una persona, y un gerente que lee
"nosotros" y luego conoce a uno nota el cambio—; el diferencial es la marca
personal, que trae el 77% del tráfico; y el "nosotros" de un solo profesional se
detecta.

El miedo que el plural intenta tapar ("¿y si a este le pasa algo?") **se
resuelve con hechos, no con un pronombre**: software libre, todo documentado,
los respaldos son del cliente y puede llevárselo. Eso convence más.

Al aplicarlo resultó que **sólo había un "nosotros" corporativo** en todo el
sitio: el subtítulo de `/services`. El resto de plurales son inclusivos ("lo
vemos con tus números", "en la llamada vemos si encaja") y significan "tú y yo",
no la empresa — esos se quedan.

## urlSlug obligatorio

Añadido en los 8 ficheros que faltaban, con la URL que ya tenían. Y **el campo
pasa a ser obligatorio en el esquema**: un fichero sin `urlSlug` no compila.

El motivo: siendo opcional, un post nuevo sin el campo volvía en silencio a
derivar la URL del título, y el problema regresaba sin que nadie se enterara.
Un error de compilación es ruidoso; una URL que se mueve sola no.

Queda fuera `storeSchema`: las páginas de tienda usan `entry.slug` (el nombre
del archivo) y no pasan por `createSlug`, así que ahí el campo no significa
nada.

Se decidió **no arreglar ninguna URL antes de congelarlas**. Las dos candidatas
eran `/blog/the-fascinating-oloid-...` (inglés en un blog en español, pero es la
página con más impresiones y posiciona para consultas en inglés: cambiarla
tiraría lo poco que tiene) y la comparativa de ERP de 78 caracteres (larga, pero
llena de las palabras por las que interesa aparecer).

Descartado poner `GENERATE_SLUG_FROM_TITLE` en `false` —que haría que la URL
saliera del nombre del archivo, ya estable y conceptualmente más limpio—:
cambiaría todas las URLs actuales, once redirects nuevos y tirar el
posicionamiento acumulado a cambio de nada que el visitante note.

Verificado: build de 120 páginas y **ninguna URL cambió** (diff de la lista
completa de rutas antes y después).

## Seguridad: el precio ya no puede venir del cliente

`src/pages/api/checkout.ts` tenía esto:

```ts
const precio = catalogItem?.amountEur ?? (precioRaw ? Number(precioRaw) : NaN);
```

Si el `asunto` no estaba en el catálogo, **el importe se tomaba del formulario**.
Cualquiera podía enviar un POST con un asunto cualquiera y `precio=1` y generar
una sesión de pago legítima de 1 €, con el nombre de producto derivado del
propio asunto. El catálogo tiene una sola entrada, así que bastaba con no usar
esa clave.

Ahora el precio y la moneda salen siempre del servidor: un `asunto` fuera del
catálogo devuelve 400, y un componente sin precio publicado devuelve 409 con un
error en el log en vez de cobrar cualquier cosa. El importe se lee de
`src/data/servicios.ts`, así que deja de estar escrito en dos sitios — antes,
cambiar el precio en la web dejaba a Stripe cobrando el viejo.

Pendiente para cuando se cobre en pesos: **el CLP es una moneda sin decimales**.
El código hace `Math.round(precio * 100)` porque Stripe cobra en la unidad
mínima, pero para CLP el multiplicador no aplica — copiar esa línea cobraría
100 veces el importe.

## El precio del blueprint en Chile: 8 UF

Con España a 300 € y Chile vacío, la tabla del mercado principal parecía la
descuidada. Ese es el argumento para rellenarlo, no la simetría en sí.

**8 UF.** Comprobado el 2026-09-04: UF = $40.879 y 1 € ≈ $1.083, así que 300 €
≈ 325.000 CLP ≈ 8,0 UF. La conversión sirvió de **control de cordura, no de
método** — la cifra es redonda a propósito. Se mantienen a la par con España
porque es el mismo trabajo y las mismas horas, y porque el descuento sobre el
proyecto ya neutraliza la objeción de precio. Si 8 UF frena conversaciones en
Chile, bajarlo es cambiar un número.

**Sin conversión automática**, por tres razones: contradice el criterio de fijar
por mercado; un precio que cambia a diario parece poco serio ("¿por qué ayer
eran 324.100 y hoy 325.040?"); y es exactamente lo que la UF viene a evitar —
la UF lleva +2,89% en el año, que es inflación que se habría comido un precio
fijo en pesos. Auto-convertir EUR→CLP a diario reintroduce la volatilidad que
la UF elimina.

El valor de la UF está en `src/data/uf.ts` con su fecha, y **la fecha se
muestra** bajo la tabla de Chile: "Referencia en pesos calculada con la UF del 4
de septiembre de 2026 ($40.879). El precio se pacta en UF." Si el valor se
queda viejo, se ve.

### Stripe: no hay que tocarlo, pero faltaba un aviso

El checkout sólo lee el precio de España y cobra en euros, así que añadir el
precio de Chile no le afecta. Pero un visitante chileno que llegara desde
`/chile` a la página del blueprint veía un botón "Pagar con Stripe" que **no
decía en qué moneda cobra**. Añadido el aviso: el pago con tarjeta va en euros,
y para Chile hay factura y transferencia en pesos.

Cobrar en pesos de verdad se puede desde una cuenta española (Stripe distingue
moneda de presentación de moneda de liquidación, con ~2% de comisión de
conversión), pero necesita el cuidado del CLP sin decimales y para un solo
producto es prematuro.

## Modelado de procesos: el componente que faltaba

La composición decía instalación, localización fiscal, migración de datos e
integraciones. **Eso lo puede ofrecer cualquiera** — instalar ERPNext y
conectarle el SII es trabajo que cotiza cualquier integrador. Lo que de verdad
se vende es que el sistema refleje cómo trabaja esa empresa, y ese trabajo no
estaba en la tabla: la oferta se leía como un producto genérico siendo lo
contrario.

Había además un vacío de secuencia. Entre "puesta en marcha" (instalación,
cuentas, permisos base) y el desarrollo a medida —que vivía en otra página, no
como componente— no había nada, y ahí se va la mayor parte del esfuerzo.

### Por qué precio fijo aunque cada empresa tenga sus procesos

La objeción es razonable y la respuesta es que el **contenido** varía mucho y la
**forma** mucho menos. Modelado en ERPNext, un proceso casi siempre se
descompone en las mismas piezas: un documento (o campos sobre uno existente),
estados y transiciones, permisos por rol, validaciones, un informe, a veces una
tarea programada. "Aprobación de compras por monto" y "aprobación de vacaciones
por jefatura" son negocios distintos y casi el mismo trabajo, así que el
esfuerzo correlaciona con cuántas piezas hacen falta, no con de qué va.

Un precio plano sí sería un error —cajas chicas no es control de subcontratos—,
de ahí los tres tramos, definidos por lo que **contienen** y no por el sector:
Simple (sobre documentos existentes), Medio (documento propio con estados y
aprobaciones), Complejo (varios documentos enlazados con efecto en contabilidad
o inventario).

**La pieza que hace que funcione: el tramo se asigna en el blueprint.** El
cliente sale de ahí con su lista de procesos, cada uno en su tramo y el total
sumado, antes de comprometerse a la implantación. Eso además justifica el
blueprint mucho mejor: deja de ser un trámite y pasa a ser lo que define el
alcance.

Descartado "por presupuesto": metería una segunda línea sin precio y, peor, el
cliente no podría estimar nada hasta después de pagar el blueprint — la
opacidad que la tabla vino a quitar. Descartada la bolsa de horas: vende tiempo
en vez de resultado e invita a contar horas.

Riesgo asumido: de vez en cuando un proceso que parecía medio resulta complejo
y se cobra de menos. Asumible porque el tramo se asigna después del blueprint y
porque la definición dice qué incluye. Un proceso que no quepa en ningún tramo
va por presupuesto, como excepción.

### El solapamiento con /services/desarrollo-integraciones

Esa página ya decía que construye "los módulos que tu operación necesita", así
que sin aclararlo el visitante veía lo mismo en dos sitios. La distinción, ahora
escrita en las dos: el **componente** es el modelado que va dentro de la
implantación; la **página** es la misma capacidad comprada después, cuando el
negocio pide algo nuevo y el sistema ya está en marcha.

Y en `/chile`, los ejemplos de construcción —subcontratos, permisos por perfil,
cajas chicas, provisiones— dejan de leerse como capacidades sueltas y pasan a
ser ejemplos de un componente que se cotiza, con enlace a los tramos.

### Nota de proceso

Los commits 84ac310 y 481e3e7 se hicieron con `git add -A` y el segundo arrastró
`EsquemaFlujo.astro`, que era trabajo de otra sesión sobre el esquema de la
home. Era trabajo terminado y coherente, sólo mal atribuido; no se reescribió
porque la rama está compartida con una sesión activa y un force-push le habría
divergido el historial. A partir de ahí se listan las rutas explícitamente.
