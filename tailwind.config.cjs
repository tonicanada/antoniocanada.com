/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
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
