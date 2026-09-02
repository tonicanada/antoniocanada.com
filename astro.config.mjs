import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://antoniocanada.com",
  output: "static",
  // "ignore" a propósito: la barra final la fuerza Vercel con `trailingSlash: true`
  // en vercel.json. Poner "always" aquí hace que el adaptador genere redirects
  // con regex y el aviso de ERR_TOO_MANY_REDIRECTS.
  trailingSlash: "ignore",
   adapter: vercel(),
  integrations: [
    react(),
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    tailwind(),
    sitemap({
      filter: (page) =>
        ![
          "/test/",
          "/gracias/",
          "/mensaje-enviado/",
          "/cancelado/",
          "/success/",
          "/blog/tag/",
        ].some((path) => page.includes(path)),
    }),
  ],
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "one-light",
      wrap: true,
    },
  },
});
