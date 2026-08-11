# Analítica, GTM y consentimiento — antoniocanada.com

Este documento explica la instrumentación de analítica del sitio: qué hace el código, qué eventos dispara, y qué queda por configurar manualmente en Google Tag Manager (GTM), Google Analytics 4 (GA4), Microsoft Clarity y Search Console.

## Arquitectura

```
Website (Astro)
  → window.dataLayer          (eventos de negocio, vía trackEvent())
  → Google Consent Mode v2    (default denegado para España/UE/EEE/UK; modo avanzado)
  → Google Tag Manager        (único script instalado directamente en la web)
      → GA4                  (tag configurado DENTRO de GTM)
      → Microsoft Clarity     (tag configurado DENTRO de GTM)
```

**Principio clave**: el código nunca instala GA4 ni Clarity directamente — solo dispara eventos a `window.dataLayer`. Toda la lógica de "qué hacer con esos eventos" (a qué herramienta enviarlos, con qué nombre, si son conversión o no) vive en GTM, sin tocar el repositorio. Esto permite añadir/quitar herramientas sin desplegar código nuevo.

### Cómo se conectan las piezas: código → GTM → GA4

Cuatro conceptos, cada uno con un rol distinto:

1. **Código → `dataLayer.push()`**: cuando pasa algo relevante, el código ejecuta `trackEvent("generate_lead", { form_name: "booking", service_name: "..." })`, que internamente hace `window.dataLayer.push({ event: "generate_lead", ...})`. Esto **no habla con GTM ni con GA4 directamente** — solo apila un objeto en un array del navegador. Es como dejar una nota en un tablón de anuncios.
2. **GTM está siempre "mirando" ese tablón**: el snippet de GTM instalado en `<head>` engancha un listener sobre `dataLayer.push`; cada vez que llega algo nuevo, lo examina.
3. **Activadores (Triggers) = "¿cuándo reacciono?"**: un activador de tipo "Evento personalizado" `generate_lead` le dice a GTM *"avísame cada vez que llegue un objeto cuyo `event` sea exactamente `generate_lead`"*. El activador no hace nada por sí solo, solo decide el momento.
4. **Variables = "¿cómo saco un dato concreto?"**: una variable de tipo "Variable de la capa de datos" (`DLV - form_name`) le dice a GTM *"cuando necesites el valor de `form_name`, lee esa propiedad del objeto que disparó esto"*. Son punteros reutilizables a campos concretos — se crean una vez y se reutilizan en varias etiquetas.
5. **Etiquetas (Tags) = "¿qué acción hago?"**: la etiqueta `GA4 - generate_lead` dice *"cuando se dispare el activador `generate_lead`, envía a GA4 un evento `generate_lead` con los parámetros `form_name`/`service_name`, usando el valor que tengan esas variables en ese momento"*.

Flujo completo para un caso real (envío exitoso de `ServiceLeadForm` en modo `booking`):

```
Usuario envía el formulario en /agendar
        │
        ▼
ServiceLeadForm.astro confirma éxito (fetch → 200 OK)
        │
        ▼
trackEvent("generate_lead", { form_name: "booking", service_name: "..." })
        │
        ▼
window.dataLayer.push({ event: "generate_lead", form_name: "...", service_name: "..." })
        │                                    ← aquí termina el código del sitio
        ▼
GTM detecta el push → revisa sus Activadores
        │
        ▼
Coincide "CE - generate_lead" (event === "generate_lead")
        │
        ▼
GTM busca qué Etiquetas usan ese Activador → encuentra "GA4 - generate_lead"
        │
        ▼
Resuelve las Variables: DLV-form_name → "booking", DLV-service_name → "..."
        │
        ▼
Dispara la etiqueta → envía a GA4 el evento con esos parámetros
        │
        ▼
Visible en GA4 DebugView / informes
```

**Dónde entra el consentimiento en esta cadena**: entre "GTM detecta el push" y "dispara la etiqueta" hay un filtro invisible — cada etiqueta puede exigir que cierto tipo de consentimiento (p. ej. `analytics_storage`) esté en `granted` antes de ejecutarse. Si el visitante no ha aceptado, la etiqueta **no se dispara aunque el activador coincida** (así se configura Clarity, y así ya viene configurado GA4 por defecto vía Consent Mode).

**Por qué esta separación vale la pena**: el código nunca menciona GA4, Clarity ni ningún ID — solo describe "qué pasó". Toda la lógica de "a qué herramienta se lo mando y cómo se llama allí" vive en GTM, configurable sin tocar código ni desplegar nada. Por eso se pudo renombrar `virtual_pageview` a `page_view` en GA4 sin tocar una línea del repositorio — solo cambiando la etiqueta en GTM.

### Dónde vive cada pieza en el código

| Pieza | Archivo |
|---|---|
| Snippet de GTM + bootstrap de Consent Mode | `src/components/analytics/GtmScripts.astro` |
| `<noscript>` de GTM (tras `<body>`) | `src/components/analytics/GtmNoscript.astro` |
| Inicialización de tracking declarativo (clicks, virtual pageviews) | `src/components/analytics/TrackingInit.astro` |
| Banner de consentimiento | `src/components/CookieConsentBanner.astro` |
| Helper `trackEvent()` + delegación de clicks | `src/lib/analytics.ts` |
| Lógica de Consent Mode / vanilla-cookieconsent | `src/lib/consent.ts` |
| Tipos globales (`window.dataLayer`, `window.gtag`) | `src/types/analytics.d.ts` |

Estos componentes se incluyen en **dos sitios** porque el sitio tiene dos raíces HTML independientes:
- `src/layouts/BaseLayout.astro` (usado por la mayoría de páginas).
- `src/pages/index.astro` (home), que define su propio `<html>` sin usar `BaseLayout`.

Si en el futuro se añade una tercera raíz HTML independiente, hay que repetir la misma inclusión de los 4 componentes ahí también.

### Variables de entorno

```
PUBLIC_GTM_ID=GTM-XXXXXXX
```

Definida en `.env`. **Hay que sustituir el valor placeholder por el Container ID real antes de desplegar a producción** — mientras no sea un ID válido, `GtmScripts.astro`/`GtmNoscript.astro` no renderizan nada (no se rompe el build, simplemente GTM no se carga).

No hace falta ninguna variable para el Measurement ID de GA4 ni para el Project ID de Clarity: ambos se configuran dentro de la interfaz de GTM, no en el código.

## Eventos disponibles

Todos se disparan con `trackEvent(nombre, params)` (`src/lib/analytics.ts`), que hace `window.dataLayer.push({ event: nombre, ...params })`. Es un no-op seguro si `window` no existe (SSR/build).

### `generate_lead`

- **Cuándo se dispara**: cuando un formulario comercial ha sido enviado y **el backend confirma éxito** (nunca al pulsar "Enviar").
- **Parámetros**: `form_name` (`"contact"` | `"booking"` | `"service_request"`), `service_name` (slug del servicio, cuando aplica).
- **Dónde está implementado**:
  - `src/components/ServiceLeadForm.astro` — tras `fetch("/api/service-lead")` responder `res.ok`, antes de las ramas de redirección. `form_name` es `"booking"` si `submitMode="booking"`, o `"service_request"` si `submitMode` es `"stripe"`/`"external"`.
  - `src/pages/mensaje-enviado.astro` — al cargar esta página (destino del formulario de `/contact`, vía Formspree). Formspree redirige aquí solo si el envío fue aceptado; es la única señal de éxito disponible para ese formulario, que no tiene JS propio. `form_name: "contact"`. Incluye una guarda con `sessionStorage` para no recontar en un refresh manual de la página.

### `whatsapp_click`

- **Cuándo se dispara**: al hacer click en cualquier enlace `wa.me`.
- **Parámetros**: `page_path` (automático, vía delegación de clicks), `link_location` (`"contact_page"` | `"sidebar_footer"`). No se envía `service_name`: los dos enlaces actuales son genéricos, no están ligados a un servicio concreto.
- **Dónde está implementado**: atributos `data-ev="whatsapp_click"` + `data-ev-params` en:
  - `src/pages/contact.astro` (enlace bajo el formulario de contacto).
  - `src/components/SideBarFooter.astro` (icono en el pie del sidebar, presente en todas las páginas).
- La delegación de clicks (`bindDeclarativeClicks` en `src/lib/analytics.ts`, inicializada por `TrackingInit.astro`) escucha cualquier click sobre `[data-ev]` y llama a `trackEvent` con el nombre de `data-ev` y los parámetros de `data-ev-params` (JSON). Para instrumentar un nuevo enlace, basta con añadir esos dos atributos — no hace falta JS nuevo.

### `booking_start`

- **Cuándo se dispara**: cuando el envío del formulario de reserva (`ServiceLeadForm` en modo `booking`) se confirma con éxito, justo antes de redirigir a la agenda externa; o al pulsar "Agendar en Google Calendar" en `/gracias` tras un pago con Stripe. No se dispara solo por visitar `/agendar` o por pulsar un enlace "Agendar" genérico — se exige la interacción real (formulario aceptado, o pago ya completado) que precede al inicio efectivo del proceso.
- **Parámetros**: `service_name`.
- **Dónde está implementado**:
  - `src/components/ServiceLeadForm.astro`, rama `else` (modo `booking`), justo antes de `window.location.assign(bookingHref)`.
  - `src/pages/gracias.astro` — atributo `data-ev="booking_start"` en el enlace "Agendar en Google Calendar"; un script inline lee `service_name` del parámetro `?servicio=` de la URL (añadido por Stripe en `success_url`) y lo inyecta en `data-ev-params` antes de que el usuario pueda hacer clic, ya que `/gracias` es una página estática y ese query param no existe en el HTML pre-generado.

### `booking_complete` — **no implementado (limitación real)**

El agendamiento final ocurre en **Google Calendar Appointment Scheduling**, un servicio externo. El flujo es: `ServiceLeadForm` (éxito) → redirect a `/api/agendar?servicio=...` → redirect 303 a la URL de Google Calendar (`PUBLIC_GOOGLE_CALENDAR_BOOKING_URL`). **No existe ningún callback, webhook, `postMessage` ni página de retorno** que informe al sitio de que la reserva se completó. Cualquier evento `booking_complete` implementado hoy sería una suposición, no un hecho verificado — por eso no se ha creado.

**Vías para implementarlo en el futuro** (requieren trabajo adicional, no solo código de tracking):

1. **Webhook desde Google Calendar/Apps Script**: un Google Apps Script vinculado al calendario que, al crearse un evento nuevo, llame a un endpoint propio (p. ej. `POST /api/booking-webhook`) que registre la reserva y pueda, por ejemplo, enviar un evento server-side a GA4 (Measurement Protocol) o marcarlo en una base de datos.
2. **Migrar a un proveedor de agendamiento con webhooks/API** (p. ej. Cal.com, Calendly con plan que incluya webhooks): estas herramientas notifican al completarse una reserva, lo que permite implementar `booking_complete` de forma fiable, incluso reenviándolo al `dataLayer` desde una página de retorno propia.
3. **Página de retorno propia**: si en el futuro el proveedor de agendamiento permite parametrizar una URL de "vuelta" tras completar la reserva (Google Calendar Appointment Scheduling actualmente no lo permite), se podría crear una página `/reserva-confirmada` que dispare el evento al cargar, igual que hace `mensaje-enviado.astro` con `generate_lead`.

### `service_cta_click`

- **Cuándo se dispara**: al pulsar un CTA comercial de navegación en la página de listado de servicios (tarjetas "Ver más →"). No se instrumenta el botón de envío de `ServiceLeadForm` (ese clic ya queda representado, de forma más precisa, por `generate_lead`/`booking_start` cuando el envío se confirma) — evita instrumentar dos veces la misma acción del usuario.
- **Parámetros**: `service_name` (slug), `page_path` (automático), `cta_text` ("Ver más"), `cta_location` ("services_listing").
- **Dónde está implementado**: `src/components/ProductCard.astro`, atributo `data-ev="service_cta_click"` con `data-ev-params` generado dinámicamente por tarjeta.

### `virtual_pageview` (plomería técnica, no es uno de los eventos de negocio pedidos)

El sitio usa **View Transitions** de Astro entre páginas que usan `BaseLayout` (activo vía `TRANSITION_API` en `src/config.ts`), lo que hace que la navegación entre ellas sea parcial (tipo SPA), no una carga completa de página. Sin este evento, GA4 solo vería el `page_view` automático de la primera carga y perdería todas las navegaciones siguientes — rompiendo la medición básica de tráfico.

- **Cuándo se dispara**: en cada evento `astro:page-load` **posterior a la carga inicial** (la primera ya la cubre el `page_view` automático de la config de GA4 al cargar GTM).
- **Parámetros**: `page_path`, `page_location`, `page_title`.
- **Dónde está implementado**: `src/lib/analytics.ts` (`bindVirtualPageviews`), inicializado por `TrackingInit.astro`.
- **Nota**: `src/pages/index.astro` (home) no usa View Transitions, así que entrar/salir de la home siempre es una navegación completa — ahí este evento no es necesario y simplemente no se dispara.

## Consentimiento de cookies

- **Librería**: [`vanilla-cookieconsent`](https://cookieconsent.orestbida.com/) v3 (npm, sin dependencias de framework, auto-hospedada). Layout de barra inferior no bloqueante, con "Aceptar"/"Rechazar" con el mismo peso visual.
- **A quién se le muestra la interfaz visible**: a **todos los visitantes**. Se evaluó limitar el banner solo a España/UE/EEE/UK usando un middleware que leyera la IP del visitante, pero se descartó: el middleware de Astro **no se ejecuta por petición real en páginas HTML prerenderizadas** (solo en rutas server-rendered como `/api/*`) — es una limitación de diseño confirmada en [un issue de Astro cerrado como "not planned"](https://github.com/withastro/astro/issues/10536), no algo solucionable sin convertir esas páginas a renderizado en servidor. Mostrar el banner a todos es la alternativa simple y segura.
- **Cumplimiento legal real (independiente de la interfaz del banner)**: `src/components/analytics/GtmScripts.astro` llama a `gtag('consent','default', {..., region: [...]})` con los códigos de país UE/EEE/UK. Esta evaluación la hace **Google, en su servidor, con la IP real de cada visita** — es la que de verdad determina si `analytics_storage`/`ad_storage` empiezan denegados o concedidos por defecto, con independencia de a quién se le muestre la barra visible.
- **Modo "avanzado" de Consent Mode**: GTM se carga para todos los visitantes desde el primer momento; lo que cambia con el consentimiento es si las señales incluyen cookies o no. Esto permite a Google seguir modelando conversiones/tráfico de quienes rechazan, sin perder toda la visibilidad.
- **Categorías configuradas**: `necessary` (siempre activa), `analytics` (GA4 + Clarity), `marketing` (reservada para una futura publicidad/remarketing; no hay ningún servicio activo en ella hoy).
- **⚠️ Pendiente de validación legal** (no inventado, hay que confirmarlo con asesoría): plazos exactos de conservación, base legal detallada para transferencias internacionales de datos (Google/Microsoft procesan datos fuera del EEE), y cualquier requisito adicional específico de la AEPD. Ver el comentario `TODO` en `src/pages/privacy.astro`.

## Configuración pendiente en Google Tag Manager

Con el contenedor GTM ya instalado en el sitio (una vez rellenado `PUBLIC_GTM_ID`), hay que configurar dentro de la interfaz de GTM:

### 1. Google Tag — GA4 Configuration

- **Tags → Nueva → Google Tag**.
- Measurement ID: el de tu propiedad GA4 (`G-XXXXXXXXXX`).
- Trigger: **Initialization - All Pages** (se activa automáticamente al cargar el contenedor).
- En **Consent Settings** de este tag: marcar como requerido `analytics_storage`. Con esto, el tag respeta automáticamente lo que hace `gtag('consent', ...)` en el sitio — no hace falta ningún trigger adicional para el consentimiento.

### 2. Trigger `generate_lead`

- **Triggers → Nuevo → Custom Event**.
- Nombre del evento: `generate_lead`.
- Se activa en: Todos los eventos personalizados.

### 3. GA4 Event `generate_lead`

- **Tags → Nueva → Google Analytics: GA4 Event**.
- Configuration Tag: la del paso 1.
- Event Name: `generate_lead`.
- Event Parameters: `form_name` → `{{dlv - form_name}}`, `service_name` → `{{dlv - service_name}}` (crear estas dos variables de tipo "Variable de capa de datos" apuntando a `form_name`/`service_name`).
- Trigger: el del paso 2.

### 4. Trigger `whatsapp_click`

- Igual que el paso 2, pero con nombre de evento `whatsapp_click`.

### 5. GA4 Event `whatsapp_click`

- Igual que el paso 3, con Event Name `whatsapp_click` y parámetros `link_location`, `page_path`.

### 6. `booking_start`

- Trigger Custom Event `booking_start` + tag GA4 Event `booking_start` con parámetro `service_name`. Mismo patrón que los anteriores.

### 7. `booking_complete`

- **No crear nada todavía** — el evento no existe en el sitio (ver limitación documentada arriba). Cuando se implemente una de las vías propuestas, se añade aquí siguiendo el mismo patrón (trigger + tag GA4 Event).

### 8. `service_cta_click`

- Trigger Custom Event `service_cta_click` + tag GA4 Event `service_cta_click` con parámetros `service_name`, `cta_text`, `cta_location`, `page_path`.

### 9. Microsoft Clarity

Clarity **no se instala en el código** — se gestiona desde GTM:

- **Tags → Nueva → busca "Microsoft Clarity" en la galería de plantillas de la Community Template Gallery** (o usa un tag de tipo "Custom HTML" con el snippet oficial de Clarity si prefieres no depender de la plantilla de la galería).
- Project ID: el de tu proyecto en [clarity.microsoft.com](https://clarity.microsoft.com).
- Trigger: **Initialization - All Pages**.
- En **Consent Settings** de este tag: marcar como requerido `analytics_storage`, igual que el tag de GA4. Clarity no lee de forma nativa las señales de Consent Mode de Google, pero el checkbox de consentimiento de GTM (disponible en cualquier tag, incluidos los Custom HTML) sí lo respeta — así el propio GTM impide que el tag se dispare hasta que haya consentimiento de analítica, sin necesidad de un trigger o evento personalizado adicional.

### `virtual_pageview` (opcional, recomendado para tráfico correcto)

- Trigger Custom Event `virtual_pageview`.
- Tag GA4 Event con Event Name `page_view` (no `virtual_pageview`) y parámetros `page_location`, `page_path`, `page_title` — así las navegaciones parciales por View Transitions cuentan como pageviews reales en GA4.

### Key Events (conversiones) recomendados en GA4

- **`generate_lead`** → marcar como Key Event.
- **`booking_complete`** → marcar como Key Event cuando se implemente.
- El resto (`whatsapp_click`, `booking_start`, `service_cta_click`, `virtual_pageview`) se recomienda dejarlos como eventos de análisis/diagnóstico, no como conversión — ayudan a entender el embudo sin inflar la métrica de conversión principal.

## Configuración pendiente en GA4

- Crear la propiedad GA4 si no existe, y configurar el tag "Google Tag" en GTM (paso 1 arriba) con su Measurement ID.
- Marcar `generate_lead` y `booking_complete` (cuando exista) como Key Events (Administración → Eventos).
- Revisar en **DebugView** que los eventos llegan con los parámetros esperados (ver sección de pruebas más abajo).

## Configuración pendiente en Search Console

No requiere ningún cambio en el código (se usa verificación DNS, no meta tags):

1. En [Google Search Console](https://search.google.com/search-console), **Añadir propiedad → Dominio** → introducir `antoniocanada.com`.
2. Google mostrará un registro **TXT** a añadir en el DNS del dominio (algo como `google-site-verification=XXXXXXXX`). Añadir ese registro TXT en el proveedor DNS del dominio y esperar la propagación (puede tardar hasta 24-48h).
3. Verificar la propiedad en Search Console una vez propagado el DNS.
4. **Vincular con GA4**: en GA4 → Administración → Enlaces de producto → Search Console → Vincular → seleccionar la propiedad de dominio verificada. Esto permite ver datos de búsqueda orgánica (consultas, clics, impresiones) combinados con el comportamiento en GA4.

## Configuración pendiente en Microsoft Clarity

1. Crear un proyecto en [clarity.microsoft.com](https://clarity.microsoft.com) para `antoniocanada.com`.
2. Copiar el Project ID.
3. Configurar el tag de Clarity en GTM (ver paso 9 arriba) con ese Project ID.
4. Comprobar en Clarity que empiezan a llegar grabaciones/heatmaps tras publicar el contenedor de GTM.

## Cómo probar todo

### GTM Preview / Tag Assistant

1. En GTM, botón **Preview** → introducir la URL del sitio (en local: `http://localhost:4321`, o la URL de producción/preview de Vercel).
2. Se abre una pestaña conectada al modo de depuración. Navega por el sitio y comprueba:
   - Que el contenedor carga una sola vez (pestaña "Summary", sin tags duplicados).
   - Que al enviar un formulario de servicio aparece el evento `generate_lead` en la capa de datos, con `form_name`/`service_name` correctos, y que **no** aparece si el envío falla.
   - Que al hacer click en un enlace de WhatsApp aparece `whatsapp_click` con `link_location` correcto.
   - Que al enviar el formulario de `/agendar` (o cualquier página de servicio en modo booking) aparecen `generate_lead` y `booking_start` en ese orden.
   - Que al hacer click en una tarjeta de `/services` aparece `service_cta_click` con el `service_name` correcto.
   - Que navegar entre páginas con View Transitions genera `virtual_pageview` (salvo en la primera carga).

### GA4 DebugView

1. Con el modo Preview de GTM activo (inyecta el parámetro de depuración automáticamente) o instalando la extensión "Google Analytics Debugger", abre GA4 → Admin → DebugView.
2. Repite las mismas acciones de arriba y confirma que los eventos llegan con los parámetros esperados, en tiempo casi real.

### Consentimiento

1. Comprueba que el banner aparece en la primera visita (cualquier navegador/ubicación) y que al rechazar/aceptar no vuelve a aparecer en sucesivas cargas de esa misma sesión/navegador.
2. Verifica en la pestaña Network/Consola que antes de aceptar, las peticiones a `google-analytics.com`/Clarity no incluyen cookies de terceros (o no se envían en absoluto), y que tras aceptar sí.
3. Borra las cookies del sitio y confirma que el banner vuelve a aparecer.

## Riesgos y notas detectadas durante la implementación

- Se intentó limitar el banner de cookies solo a España/UE/UK usando un middleware de Astro que leyera la IP del visitante (`src/middleware.ts`). Se descartó tras confirmar (build local + [issue de Astro](https://github.com/withastro/astro/issues/10536)) que el middleware de Astro no se ejecuta por petición real en páginas HTML prerenderizadas, solo en build time — hubiera requerido convertir esas páginas a renderizado en servidor. El banner se muestra a todos los visitantes en su lugar; el cumplimiento legal para la UE no depende de esto (ver sección de Consentimiento).
- `booking_complete` no está implementado — ver limitación documentada arriba. No inventar este evento sin una fuente real de confirmación.
- Los dos enlaces de WhatsApp actuales son genéricos (no ligados a un servicio); si en el futuro se añaden enlaces de WhatsApp específicos por servicio, añadir `service_name` a su `data-ev-params`.
- El botón "Pagar con Stripe" de `services/diagnostico-procesos.astro` ya genera `generate_lead` al enviar el formulario previo; la confirmación de pago real ocurre en `/gracias` (con `?servicio=`), que podría instrumentarse en el futuro como un evento de compra/conversión adicional si se necesita medir ingresos, sin que esto forme parte del alcance actual.
