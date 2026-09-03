import { z, defineCollection } from "astro:content";

// 🔁 Campo reutilizable para tags únicos
const uniqueTags = z
  .array(z.string())
  .refine((items) => new Set(items).size === items.length, {
    message: "tags must be unique",
  });

// 📚 Blog
const blogSchema = z.object({
  urlSlug: z.string().optional(), // fija la URL; ver src/lib/createSlug.ts
  title: z.string(),
  description: z.string(),
  publishDate: z.coerce.date(), // ← unificado
  updatedDate: z.coerce.date().optional(),
  image: z.string().optional(), // ← para mantener consistencia con 'integraciones' y 'courses'
  badge: z.string().optional(),
  tags: uniqueTags.optional(),
});

// 🛒 Store
const storeSchema = z.object({
  urlSlug: z.string().optional(), // fija la URL; ver src/lib/createSlug.ts
  title: z.string(),
  description: z.string(),
  custom_link_label: z.string(),
  custom_link: z.string().optional(),
  updatedDate: z.coerce.date(), // ← unificado (antes: updatedDate)
  pricing: z.string().optional(),
  oldPricing: z.string().optional(),
  badge: z.string().optional(),
  checkoutUrl: z.string().optional(),
  image: z.string().optional(),
});

// 🔌 Integraciones
const integracionSchema = z.object({
  urlSlug: z.string().optional(), // fija la URL; ver src/lib/createSlug.ts
  title: z.string(),
  description: z.string(),
  publishDate: z.coerce.date(),
  image: z.string(),
  tags: uniqueTags,
  github: z.string().optional(),
  demo: z.string().optional(),
});

// 🎓 Cursos
const courseSchema = z.object({
  urlSlug: z.string().optional(), // fija la URL; ver src/lib/createSlug.ts
  title: z.string(),
  description: z.string(),
  publishDate: z.coerce.date(),
  image: z.string(),
  tags: uniqueTags.optional(),
});

export type BlogSchema = z.infer<typeof blogSchema>;
export type StoreSchema = z.infer<typeof storeSchema>;
export type IntegracionSchema = z.infer<typeof integracionSchema>;
export type CourseSchema = z.infer<typeof courseSchema>;

const blogCollection = defineCollection({ schema: blogSchema });
const storeCollection = defineCollection({ schema: storeSchema });
const integracionesCollection = defineCollection({ schema: integracionSchema });
const courseCollection = defineCollection({ schema: courseSchema });
const erpnextCollection = defineCollection({ schema: blogSchema });

export const collections = {
  blog: blogCollection,
  store: storeCollection,
  integraciones: integracionesCollection,
  courses: courseCollection,
  erpnext: erpnextCollection,
};
