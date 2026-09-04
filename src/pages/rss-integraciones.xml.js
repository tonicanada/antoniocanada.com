import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const entradas = await getCollection("integraciones");

  return rss({
    title: "Antonio Cañada | Integraciones",
    description: "Integraciones de ERPNext con facturación electrónica, banca, compras e IA.",
    site: context.site,
    items: entradas
      .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf())
      .map((entrada) => ({
        title: entrada.data.title,
        pubDate: entrada.data.publishDate,
        description: entrada.data.description,
        link: `/integraciones/${entrada.data.urlSlug ?? entrada.slug}/`,
      })),
  });
}
