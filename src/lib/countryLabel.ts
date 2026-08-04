import type { CountryMeta } from "@/data/countries";

export function countryLabel(meta: CountryMeta, locale: string): string {
  return locale === "es" ? meta.name : meta.nameEn;
}
