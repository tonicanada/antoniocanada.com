import { z, defineCollection } from "astro:content";

// 🔁 Campo reutilizable para tags únicos
const uniqueTags = z
  .array(z.string())
  .refine((items) => new Set(items).size === items.length, {
    message: "tags must be unique",
  });

// 📚 Blog
const blogSchema = z.object({
  // Obligatorio a propósito: si fuera opcional, un fichero nuevo sin este
  // campo volvería en silencio a derivar la URL del título, y editar ese
  // título rompería los enlaces externos sin que nadie se enterara. Ya pasó:
  // el vídeo con 163 vistas/mes apuntó meses a un 404. Ver src/lib/createSlug.ts
  urlSlug: z.string(),
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
  // Obligatorio a propósito: si fuera opcional, un fichero nuevo sin este
  // campo volvería en silencio a derivar la URL del título, y editar ese
  // título rompería los enlaces externos sin que nadie se enterara. Ya pasó:
  // el vídeo con 163 vistas/mes apuntó meses a un 404. Ver src/lib/createSlug.ts
  urlSlug: z.string(),
  title: z.string(),
  description: z.string(),
  publishDate: z.coerce.date(),
  image: z.string(),
  /** Qué parte de la portada se conserva al recortarla a banda 3:1. Por defecto
      el centro, que sirve cuando el motivo va centrado; en una foto con el
      contenido abajo —un rótulo, un pie— hay que bajarlo o se corta. Acepta
      cualquier valor de `object-position`: "center", "bottom", "50% 70%". */
  imagePosition: z.string().optional(),
  tags: uniqueTags,
  github: z.string().optional(),
  demo: z.string().optional(),
});

// 🎓 Cursos
const courseSchema = z.object({
  // Obligatorio a propósito: si fuera opcional, un fichero nuevo sin este
  // campo volvería en silencio a derivar la URL del título, y editar ese
  // título rompería los enlaces externos sin que nadie se enterara. Ya pasó:
  // el vídeo con 163 vistas/mes apuntó meses a un 404. Ver src/lib/createSlug.ts
  urlSlug: z.string(),
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
