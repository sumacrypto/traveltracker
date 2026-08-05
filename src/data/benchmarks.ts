/**
 * Distribución de referencia: qué porcentaje de la población mundial visitó
 * COMO MÁXIMO N países en su vida.
 *
 * Estos números son un fallback precargado, no data propia. Se arman
 * interpolando tres anclas publicadas:
 *   - Agoda (2023): ~68% de la gente visitó hasta 10 países.
 *   - Percentil 95 en países ricos: 25 a 30 países.
 *   - 50 países ubica a alguien en el percentil 99.
 *
 * Cuando la app tenga usuarios registrados suficientes, esta curva se reemplaza
 * por la distribución real agregada (que además va a poder segmentarse por país,
 * ciudad y edad). Hasta entonces la copy tiene que decir "en el mundo", no
 * inventar precisión que no tenemos.
 */
export interface CdfAnchor {
  /** Cantidad de países visitados */
  countries: number;
  /** % de la población que visitó como máximo esa cantidad */
  share: number;
}

export const GLOBAL_CDF: CdfAnchor[] = [
  // Las tres primeras anclas salen directo de Pew (mediana de 24 países): 21%
  // nunca salió, 34% visitó entre 1 y 4, 17% entre 5 y 9.
  { countries: 0, share: 21 },
  { countries: 4, share: 55 },
  { countries: 9, share: 72 },
  // De acá para arriba Pew solo dice "13% visitó 10 o más". El resto de la curva
  // se ajusta a las dos referencias del brief: el percentil 95 cae entre 25 y 30
  // países, y 50 países deja a alguien en el percentil 99.
  { countries: 15, share: 82 },
  { countries: 20, share: 88 },
  { countries: 25, share: 93 },
  { countries: 30, share: 96 },
  { countries: 40, share: 98 },
  { countries: 50, share: 99 },
  { countries: 75, share: 99.7 },
  { countries: 100, share: 99.9 },
  { countries: 195, share: 100 },
];

/**
 * Datos de Pew Research (2023) por país. Son hechos puntuales verificables, no
 * curvas completas: la encuesta publica el porcentaje que nunca salió del país y
 * el que llegó a diez o más, no la distribución entera.
 *
 * Preferimos citar el dato exacto de cada país antes que inventar una curva
 * nacional a partir de la global. Los países que no están acá se comparan contra
 * el mundo, y la app lo dice explícitamente.
 */
export interface CountryTravelFact {
  /** % que nunca viajó al exterior */
  neverTraveled?: number;
  /** % que visitó 5 países o más */
  fiveOrMore?: number;
  /** % que visitó 10 países o más */
  tenOrMore?: number;
}

/**
 * Solo van los números que el informe afirma explícitamente. Para Argentina,
 * Brasil, México, India, Indonesia y los países africanos encuestados, Pew
 * publica que "alrededor del 3% o menos visitó cinco países o más"; ese es el
 * dato que se cita, y no un porcentaje inventado de "nunca viajó" que la
 * encuesta no da desagregado.
 */
export const COUNTRY_TRAVEL_FACTS: Record<string, CountryTravelFact> = {
  SE: { neverTraveled: 0, tenOrMore: 57 },
  NL: { neverTraveled: 1, tenOrMore: 50 },
  US: { neverTraveled: 25, tenOrMore: 11 },
  IN: { neverTraveled: 95, fiveOrMore: 3 },
  AR: { fiveOrMore: 3 },
  BR: { fiveOrMore: 3 },
  MX: { fiveOrMore: 3 },
  ID: { fiveOrMore: 3 },
  KE: { fiveOrMore: 3 },
  NG: { fiveOrMore: 3 },
  ZA: { fiveOrMore: 3 },
};

/** Los mismos números para el mundo, como fallback. */
export const WORLD_TRAVEL_FACT: CountryTravelFact = { neverTraveled: 21, tenOrMore: 13 };

/**
 * Las tres categorías que usa el propio informe de Pew (no una que armamos
 * nosotros): "nontraveler" / "casual traveler" / "globe-trotter". Población:
 * adultos de EE.UU., no el mundo — es un informe distinto al de 24 países que
 * alimenta GLOBAL_CDF más arriba.
 *
 * Se usa como comparación de respaldo en la sección de edad cuando todavía no
 * hay bastante gente de la misma edad registrada. No reemplaza un dato por
 * edad porque no lo hay: el propio informe de Pew dice explícitamente que la
 * edad casi no cambia la experiencia de viaje ("very few age differences in
 * travel experience"), así que no existe una curva por edad que ofrecer en su
 * lugar — investigado a pedido explícito, no es una suposición.
 */
export type PewTravelTier = "nontraveler" | "casual" | "globeTrotter";

export function pewTravelTier(visited: number): PewTravelTier {
  if (visited <= 0) return "nontraveler";
  if (visited < 5) return "casual";
  return "globeTrotter";
}

/** % de adultos de EE.UU. en cada categoría. */
export const PEW_TIER_SHARE: Record<PewTravelTier, number> = {
  nontraveler: 23,
  casual: 50,
  globeTrotter: 26,
};

export const PEW_TRAVEL_TIERS_SOURCE = "Pew Research, 2023";

export const PEW_SOURCE = "Pew Research, 2023";

export const BENCHMARK_SOURCES = [
  { label: PEW_SOURCE, detail: "encuesta de viajes internacionales en 24 países" },
];
