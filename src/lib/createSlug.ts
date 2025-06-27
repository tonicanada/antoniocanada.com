import { GENERATE_SLUG_FROM_TITLE } from '../config'

export default function (title: string, staticSlug: string) {
  return (
    !GENERATE_SLUG_FROM_TITLE ? staticSlug :
    title
      .trim()
      .toLowerCase()
      .normalize('NFD') // descompone letras con tilde (ó -> o + ´)
      .replace(/[\u0300-\u036f]/g, '') // elimina tildes y acentos
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '') // ahora no eliminará letras válidas con tilde
      .replace(/^-+|-+$/g, '')
  )
}
