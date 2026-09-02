import { GENERATE_SLUG_FROM_TITLE } from '../config'

/**
 * URL de una entrada de contenido.
 *
 * `urlSlug` (opcional, en el frontmatter) fija la URL y gana siempre. Úsalo en
 * cualquier página que tenga enlaces externos apuntando a ella: sin él la URL
 * se deriva del título, así que editar el título la mueve y rompe esos enlaces
 * sin ningún aviso.
 */
export default function (title: string, staticSlug: string, urlSlug?: string) {
  if (urlSlug) return urlSlug;

  return (
    !GENERATE_SLUG_FROM_TITLE ? staticSlug :
    title
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')           // convierte espacios a guiones
      .replace(/[^\w-]/g, '')         // elimina símbolos
      .replace(/--+/g, '-')           // <- esta línea elimina guiones duplicados
      .replace(/^-+|-+$/g, '')        // elimina guiones iniciales/finales
  );
}
