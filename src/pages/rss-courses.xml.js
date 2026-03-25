import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const courses = await getCollection("courses");

  return rss({
    title: "Antonio Cañada | Cursos",
    description: "Últimos cursos y formaciones publicados en antoniocanada.com.",
    site: context.site,
    items: courses
      .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf())
      .map((course) => ({
        title: course.data.title,
        pubDate: course.data.publishDate,
        description: course.data.description,
        link: `/courses/${course.slug}/`,
      })),
  });
}
