import { COUNTRIES, type CountryMeta } from "@/data/countries";
import { countryLabel } from "./countryLabel";

/**
 * Búsqueda insensible a acentos: nadie escribe "Japón" con tilde ni "Åland" con
 * el anillo. Se compara contra el nombre en español, el inglés y el código.
 */
export function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export interface CountryEntry {
  /** id de geometría del TopoJSON */
  key: string;
  meta: CountryMeta;
  haystack: string;
}

// Ordenado por código y no por nombre: el nombre a mostrar depende del idioma
// activo, así que no hay un orden alfabético único para fijar acá. El orden
// final por idioma se arma en sortByLocale(), llamado desde searchCountries().
export const COUNTRY_ENTRIES: CountryEntry[] = Object.entries(COUNTRIES)
  .filter(([, meta]) => meta.countable)
  .map(([key, meta]) => ({
    key,
    meta,
    haystack: normalize(`${meta.name} ${meta.nameEn} ${meta.code}`),
  }))
  .sort((a, b) => a.meta.code.localeCompare(b.meta.code));

function sortByLocale(entries: CountryEntry[], locale: string): CountryEntry[] {
  return [...entries].sort((a, b) =>
    countryLabel(a.meta, locale).localeCompare(countryLabel(b.meta, locale), locale),
  );
}

/**
 * Los que empiezan con lo tipeado van primero: buscando "chi" interesa más Chile
 * que Machu... que Indochina.
 */
export function searchCountries(query: string, locale: string, limit?: number): CountryEntry[] {
  const q = normalize(query);
  const source = sortByLocale(COUNTRY_ENTRIES, locale);
  if (!q) return limit ? source.slice(0, limit) : source;

  const starts: CountryEntry[] = [];
  const contains: CountryEntry[] = [];

  for (const entry of source) {
    if (entry.haystack.startsWith(q)) starts.push(entry);
    else if (entry.haystack.includes(q)) contains.push(entry);
    if (limit && starts.length >= limit) break;
  }

  const results = [...starts, ...contains];
  return limit ? results.slice(0, limit) : results;
}
