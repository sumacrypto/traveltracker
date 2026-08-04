import type { SubdivisionSet } from "@/data/subdivisions";

/**
 * El inglés no tiene género gramatical, así que no hay "artículo en inglés"
 * que darle a `SubdivisionSet.article` — por eso label/singular vienen
 * separados por idioma en la data generada, en vez de intentar traducir el
 * artículo español.
 */
export function subdivisionLabel(set: SubdivisionSet, locale: string): string {
  return locale === "es" ? set.label : set.labelEn;
}

export function subdivisionSingular(set: SubdivisionSet, locale: string): string {
  return locale === "es" ? set.singular : set.singularEn;
}
