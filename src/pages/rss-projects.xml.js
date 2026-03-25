import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const projects = await getCollection("projects");

  return rss({
    title: "Antonio Cañada | Proyectos",
    description: "Últimos proyectos y casos reales publicados en antoniocanada.com.",
    site: context.site,
    items: projects
      .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf())
      .map((project) => ({
        title: project.data.title,
        pubDate: project.data.publishDate,
        description: project.data.description,
        link: `/projects/${project.slug}/`,
      })),
  });
}
