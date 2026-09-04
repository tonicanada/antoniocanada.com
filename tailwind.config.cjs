/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			// Los dos únicos anchos de columna del sitio. Antes había tres, y ninguno
			// era una decisión: 900 px en el `main` por defecto, 768 px (`max-w-3xl`)
			// en las páginas de servicio, y `min(750px, 80vw)` en los artículos.
			//
			// `measure` es la medida de lectura: 43rem ≈ 66 caracteres con el cuerpo a
			// 17 px, que es el rango donde el ojo no pierde el renglón al saltar de
			// línea. Todo lo que sea texto seguido va aquí.
			//
			// `wide` es para rejillas y tablas —tarjetas, comparativas, listados—, que
			// no se leen por renglones y agradecen el espacio. 56rem son los 900 px de
			// antes menos un pelo, así que las páginas que ya usaban el `main` por
			// defecto no se mueven.
			maxWidth: {
				measure: '43rem',
				wide: '56rem',
			},
			animation: {
				gradient: "gradient 20s ease infinite",
			},
			keyframes: {
				gradient: {
					"0%": { backgroundPosition: "0% 50%" },
					"50%": { backgroundPosition: "100% 50%" },
					"100%": { backgroundPosition: "0% 50%" },
				},
			},
			// El tema de `prose` es lo que unifica de verdad las dos familias de
			// páginas. Antes el MDX se componía con `prose md:prose-lg` y las páginas
			// `.astro` repetían a mano `mt-10 text-2xl font-semibold text-gray-900` en
			// cada `h2` — cuarenta veces en el repo, y con derivas. Ahora las dos
			// pintan con estas reglas.
			//
			// Y va compacto a propósito: `prose-lg` daba 18 px con interlineado 1,75
			// sobre 750 px, o sea renglones de 85–95 caracteres con mucho aire entre
			// ellos. Se leía como un folleto, no como documentación.
			typography: (theme) => ({
				DEFAULT: {
					css: {
						// El ancho lo pone el contenedor (`max-w-measure`), no `prose`:
						// si lo pusieran los dos, gana el más estrecho por accidente.
						maxWidth: 'none',
						color: theme('colors.gray.700'),
						fontSize: '1.0625rem',
						lineHeight: '1.75',
						'--tw-prose-headings': theme('colors.gray.900'),
						'--tw-prose-bold': theme('colors.gray.900'),
						'--tw-prose-links': theme('colors.gray.900'),
						'--tw-prose-counters': theme('colors.gray.500'),
						'--tw-prose-bullets': theme('colors.gray.300'),
						'--tw-prose-quotes': theme('colors.gray.700'),
						'--tw-prose-quote-borders': theme('colors.gray.200'),
						p: { marginTop: '1rem', marginBottom: '1rem' },
						// Los títulos se separan por arriba y se pegan a su párrafo por
						// abajo: es lo que hace que una sección se lea como un bloque y
						// no como títulos flotando a media distancia de dos textos.
						h2: {
							fontSize: '1.5rem',
							fontWeight: '600',
							lineHeight: '1.3',
							marginTop: '2.75rem',
							marginBottom: '0.75rem',
						},
						h3: {
							fontSize: '1.1875rem',
							fontWeight: '600',
							lineHeight: '1.4',
							marginTop: '2rem',
							marginBottom: '0.5rem',
						},
						h4: {
							fontSize: '1.0625rem',
							fontWeight: '600',
							marginTop: '1.5rem',
							marginBottom: '0.375rem',
						},
						'ul, ol': { marginTop: '1rem', marginBottom: '1rem', paddingLeft: '1.375rem' },
						li: { marginTop: '0.375rem', marginBottom: '0.375rem' },
						'li > p': { marginTop: '0.25rem', marginBottom: '0.25rem' },
						'ul ul, ul ol, ol ul, ol ol': { marginTop: '0.375rem', marginBottom: '0.375rem' },
						a: {
							fontWeight: 'inherit',
							textDecoration: 'underline',
							textUnderlineOffset: '2px',
							textDecorationColor: theme('colors.gray.400'),
						},
						'a:hover': { textDecorationColor: theme('colors.gray.900') },
						// Las reglas separan secciones; sin esto se comían el margen del
						// título siguiente y la separación quedaba al azar.
						hr: { marginTop: '2.75rem', marginBottom: '2.25rem' },
						'hr + h2, hr + h3, hr + h4': { marginTop: '0' },
						blockquote: { fontStyle: 'normal', fontWeight: '400' },
						'blockquote p:first-of-type::before': { content: 'none' },
						'blockquote p:last-of-type::after': { content: 'none' },
						code: {
							fontSize: '0.9em',
							fontWeight: '500',
							backgroundColor: theme('colors.gray.100'),
							padding: '0.15em 0.35em',
							borderRadius: '0.25rem',
						},
						'code::before': { content: 'none' },
						'code::after': { content: 'none' },
						'pre code': { backgroundColor: 'transparent', padding: '0' },
						img: { marginTop: '1.75rem', marginBottom: '1.75rem', borderRadius: '0.5rem' },
						'table': { fontSize: '0.9375rem' },
					},
				},
			}),
			scrollSnapType: {
				mandatory: 'y mandatory',
			},
		},
	},
	plugins: [require("@tailwindcss/typography"), require("daisyui"), require("@tailwindcss/aspect-ratio")],
	daisyui: {
		// Solo el tema que el sitio usa de verdad (`data-theme="lofi"`). Con `themes: true`
		// daisyUI compilaba los 32 temas: 144 KB de CSS, de los que 120 eran reglas
		// `[data-theme=cyberpunk]` y compañía que nunca se aplican.
		themes: ["lofi"],
		// Sin `darkTheme`: el sitio fija `data-theme="lofi"` en el <html> y no tiene
		// modo oscuro. Apuntar a un tema que ya no se compila no haría nada.
		logs: false, // Shows info about daisyUI version and used config in the console when building your CSS
	}
}
