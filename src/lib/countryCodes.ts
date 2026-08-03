import { COUNTRIES, GEOMETRY_ID_BY_CODE } from "@/data/countries";

/**
 * El mapa trabaja con ids de geometría (ISO numérico) porque es lo que trae el
 * TopoJSON; la base guarda alpha-2, que es lo legible y estable. Estas dos
 * funciones son el único puente entre ambos mundos.
 */
export function toCountryCode(geometryId: string): string | null {
  return COUNTRIES[geometryId]?.code ?? null;
}

export function toGeometryId(countryCode: string): string | null {
  return GEOMETRY_ID_BY_CODE[countryCode] ?? null;
}

export function geometryIdsToCodes(geometryIds: Iterable<string>): string[] {
  const codes: string[] = [];
  for (const id of geometryIds) {
    const code = toCountryCode(id);
    if (code) codes.push(code);
  }
  return codes;
}

export function codesToGeometryIds(codes: Iterable<string>): string[] {
  const ids: string[] = [];
  for (const code of codes) {
    const id = toGeometryId(code);
    if (id) ids.push(id);
  }
  return ids;
}
