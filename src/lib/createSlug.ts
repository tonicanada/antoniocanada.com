import { GENERATE_SLUG_FROM_TITLE } from '../config'

export default function (title: string, staticSlug: string) {
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