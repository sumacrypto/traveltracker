import { COUNTRIES, type CountryMeta } from "@/data/countries";

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

export const COUNTRY_ENTRIES: CountryEntry[] = Object.entries(COUNTRIES)
  .filter(([, meta]) => meta.countable)
  .map(([key, meta]) => ({
    key,
    meta,
    haystack: normalize(`${meta.name} ${meta.nameEn} ${meta.code}`),
  }))
  .sort((a, b) => a.meta.name.localeCompare(b.meta.name, "es"));

/**
 * Los que empiezan con lo tipeado van primero: buscando "chi" interesa más Chile
 * que Machu... que Indochina.
 */
export function searchCountries(query: string, limit?: number): CountryEntry[] {
  const q = normalize(query);
  if (!q) return limit ? COUNTRY_ENTRIES.slice(0, limit) : COUNTRY_ENTRIES;

  const starts: CountryEntry[] = [];
  const contains: CountryEntry[] = [];

  for (const entry of COUNTRY_ENTRIES) {
    if (entry.haystack.startsWith(q)) starts.push(entry);
    else if (entry.haystack.includes(q)) contains.push(entry);
    if (limit && starts.length >= limit) break;
  }

  const results = [...starts, ...contains];
  return limit ? results.slice(0, limit) : results;
}
