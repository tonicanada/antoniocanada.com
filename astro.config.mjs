import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  integrations: [
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    tailwind(),
    sitemap(),
  ],
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "one-light", // Puedes cambiarlo por github-dark, nord, etc.
      wrap: true
    }
  }
});
