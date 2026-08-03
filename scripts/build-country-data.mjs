/**
 * Genera:
 *  - public/geo/countries-50m.json  (topología del mapa, servida como asset estático)
 *  - src/data/countries.ts          (metadata por país: ISO, nombre en español, continente)
 *
 * Correr con: npm run build:data
 */
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const worldCountries = require("world-countries");
const topology = require("world-atlas/countries-50m.json");

const REGION_ES = {
  Africa: "África",
  Americas: "América",
  Asia: "Asia",
  Europe: "Europa",
  Oceania: "Oceanía",
  Antarctic: "Antártida",
};

// Geometrías de Natural Earth sin código ISO numérico: territorios disputados o
// de facto. Kosovo se marca como territorio clickeable pero no cuenta para el
// total de 195 (no es miembro de la ONU). El resto queda como tierra inerte.
const UNMATCHED = {
  Kosovo: { code: "XK", name: "Kosovo", region: "Europe", subregion: "Southeast Europe" },
};

const byNumeric = new Map(worldCountries.map((c) => [c.ccn3, c]));

/** @type {Record<string, unknown>} */
const countries = {};
const geometries = topology.objects.countries.geometries;
const skipped = [];

for (const geometry of geometries) {
  const numeric = geometry.id === undefined ? undefined : String(geometry.id).padStart(3, "0");
  const match = numeric ? byNumeric.get(numeric) : undefined;

  if (match) {
    // 193 miembros de la ONU + Vaticano (que world-countries marca como miembro)
    // + Palestina = los 195 países del recuento estándar.
    const countable = match.unMember || match.cca2 === "PS";
    countries[geometry.id] = {
      code: match.cca2,
      name: match.translations?.spa?.common ?? match.name.common,
      nameEn: match.name.common,
      region: REGION_ES[match.region] ?? match.region,
      subregion: match.subregion || null,
      countable,
      flag: match.flag,
    };
    continue;
  }

  const fallback = UNMATCHED[geometry.properties?.name];
  if (fallback) {
    countries[geometry.properties.name] = {
      code: fallback.code,
      name: fallback.name,
      nameEn: fallback.name,
      region: REGION_ES[fallback.region],
      subregion: fallback.subregion,
      countable: false,
      flag: "🇽🇰",
    };
  } else {
    skipped.push(geometry.properties?.name ?? "(sin nombre)");
  }
}

// Los denominadores salen del padrón ISO completo, no de las geometrías dibujadas:
// a 1:50m el mapa no traza algunos microestados (Mónaco, Nauru, Tuvalu...), pero
// el recuento canónico sigue siendo 195 y eso no depende de la resolución.
const canonical = worldCountries.filter((c) => c.unMember || c.cca2 === "PS");
const totalsByRegion = {};
for (const country of canonical) {
  const region = REGION_ES[country.region] ?? country.region;
  totalsByRegion[region] = (totalsByRegion[region] ?? 0) + 1;
}
const WORLD_TOTAL = canonical.length;

const drawn = Object.values(countries).filter((c) => c.countable).map((c) => c.code);
const undrawn = canonical.filter((c) => !drawn.includes(c.cca2)).map((c) => c.cca2);

const allRegions = [...new Set(Object.values(countries).map((c) => c.region))].sort();

const header = `// GENERADO POR scripts/build-country-data.mjs - no editar a mano.
// Fuentes: world-atlas (Natural Earth 1:50m) + world-countries (ISO 3166).

/** Continentes que entran en el recuento de 195 países. */
export type Continent = ${Object.keys(totalsByRegion)
  .sort()
  .map((r) => JSON.stringify(r))
  .join(" | ")};

/** Incluye además regiones sin países contables (territorios antárticos). */
export type Region = ${allRegions.map((r) => JSON.stringify(r)).join(" | ")};

export interface CountryMeta {
  /** ISO 3166-1 alpha-2 */
  code: string;
  /** Nombre en español */
  name: string;
  nameEn: string;
  region: Region;
  subregion: string | null;
  /** Si suma al total de 195 países */
  countable: boolean;
  flag: string;
}

/** Clave = id de la geometría en el TopoJSON (ISO 3166-1 numérico). */
export const COUNTRIES: Record<string, CountryMeta> = ${JSON.stringify(countries, null, 2)};

/** Índice inverso: alpha-2 -> id de geometría. */
export const GEOMETRY_ID_BY_CODE: Record<string, string> = ${JSON.stringify(
  Object.fromEntries(Object.entries(countries).map(([id, c]) => [c.code, id])),
  null,
  2,
)};

/** Países del recuento oficial por continente. */
export const COUNTRIES_PER_CONTINENT: Record<Continent, number> = ${JSON.stringify(
  totalsByRegion,
  null,
  2,
)};

export const WORLD_TOTAL = ${WORLD_TOTAL};

export const CONTINENTS = ${JSON.stringify(Object.keys(totalsByRegion).sort((a, b) => a.localeCompare(b, "es")), null, 2)} as const;

export function isContinent(region: Region): region is Continent {
  return region in COUNTRIES_PER_CONTINENT;
}
`;

mkdirSync(new URL("../src/data/", import.meta.url), { recursive: true });
mkdirSync(new URL("../public/geo/", import.meta.url), { recursive: true });

writeFileSync(new URL("../src/data/countries.ts", import.meta.url), header);
copyFileSync(
  require.resolve("world-atlas/countries-50m.json"),
  new URL("../public/geo/countries-50m.json", import.meta.url),
);

console.log(`✓ ${Object.keys(countries).length} geometrías con metadata`);
console.log(`✓ ${WORLD_TOTAL} países en el recuento oficial, ${drawn.length} dibujados a 1:50m`);
console.log(`✓ por continente:`, totalsByRegion);
if (undrawn.length) console.log(`· sin geometría a esta resolución: ${undrawn.join(", ")}`);
if (skipped.length) console.log(`· tierra sin ISO (no clickeable): ${skipped.join(", ")}`);
