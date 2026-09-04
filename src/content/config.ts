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
  /** Cómo se encaja la portada bajo la cabecera. Por defecto `banda`: recorte
      3:1, que es lo correcto para una foto —se va fondo— y mantiene la portada
      baja. `completa` la muestra entera sin recortar nada, a costa de ocupar
      más alto; es para las portadas que son un diagrama, donde lo de arriba y
      lo de abajo es contenido y no aire. */
  imageAspect: z.enum(["banda", "completa"]).optional(),
  badge: z.string().optional(),
  tags: uniqueTags.optional(),
});

// 🛒 Store

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
export type IntegracionSchema = z.infer<typeof integracionSchema>;
export type CourseSchema = z.infer<typeof courseSchema>;

const blogCollection = defineCollection({ schema: blogSchema });
const integracionesCollection = defineCollection({ schema: integracionSchema });
const courseCollection = defineCollection({ schema: courseSchema });
const erpnextCollection = defineCollection({ schema: blogSchema });

export const collections = {
  blog: blogCollection,
  integraciones: integracionesCollection,
  courses: courseCollection,
  erpnext: erpnextCollection,
};
