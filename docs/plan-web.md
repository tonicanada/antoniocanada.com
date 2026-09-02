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
https://antoniocanada.com/projects/erpnext-fintoc-conciliacion-bancaria-automatica/?utm_source=youtube&utm_medium=video&utm_campaign=fintoc
```

Las diez páginas destino verificadas con `curl` contra producción: todas 200.

⚠️ **Requisito para la Fase 2**: la última URL cambia cuando `/projects` se
sustituya por `/integraciones`. Hay que dejar un 301 de
`/projects/erpnext-fintoc-conciliacion-bancaria-automatica/` a
`/integraciones/banco/` (y del resto de `/projects/*`) o los enlaces de YouTube
se rompen.

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
| `/services` | **Cerrar el mes no debería llevar tres semanas** | reservado (Fase 3) |
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

⚠️ **Requisito de Fase 2**: hoy apunta a `/projects` porque `/integraciones` no
existe todavía y no se deja un enlace roto en producción. Al crear la página hay
que cambiar el `href` y el `service_name` del evento en `EsquemaFlujo.astro`.

## Estructura de la home: una sección por pantalla

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
