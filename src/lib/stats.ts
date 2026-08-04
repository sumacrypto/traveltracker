import {
  COUNTRIES,
  COUNTRIES_PER_CONTINENT,
  CONTINENTS,
  WORLD_TOTAL,
  isContinent,
  type Continent,
  type CountryMeta,
} from "@/data/countries";
import { GLOBAL_CDF } from "@/data/benchmarks";

export interface ContinentStat {
  continent: Continent;
  visited: number;
  total: number;
  percent: number;
}

export interface TripStats {
  visited: number;
  total: number;
  worldPercent: number;
  /** % de la población que visitó estrictamente menos países que vos */
  beatsPercent: number;
  continents: ContinentStat[];
  /** Continente con más países marcados, para la copy */
  strongest: ContinentStat | null;
}

/** Metadata del país a partir del id de geometría del TopoJSON. */
export function getCountry(geometryId: string): CountryMeta | undefined {
  return COUNTRIES[geometryId];
}

/**
 * Interpola la curva acumulada. Devuelve el % de gente que visitó como máximo
 * `countries` países.
 */
function cdf(countries: number): number {
  if (countries <= GLOBAL_CDF[0].countries) return GLOBAL_CDF[0].share;
  for (let i = 1; i < GLOBAL_CDF.length; i++) {
    const prev = GLOBAL_CDF[i - 1];
    const next = GLOBAL_CDF[i];
    if (countries <= next.countries) {
      const t = (countries - prev.countries) / (next.countries - prev.countries);
      return prev.share + t * (next.share - prev.share);
    }
  }
  return 100;
}

/**
 * "Le ganás al X% de la gente": porcentaje que visitó estrictamente menos países.
 * Con 0 países no le ganás a nadie, así que arranca en 0 y no en el 20% de la curva.
 */
export function beatsPercent(visited: number): number {
  if (visited <= 0) return 0;
  return Math.round(cdf(visited - 1));
}

/** % de la población mundial que visitó `countries` países o más. */
export function worldTailShare(countries: number): number {
  if (countries <= 0) return 100;
  return Math.max(0, 100 - cdf(countries - 1));
}

/**
 * Estima en qué porción más viajada de un país cae alguien con `visited` países.
 *
 * Los datos publicados por país son un solo punto ("el 3% de los argentinos
 * llegó a cinco países"), no una distribución. Decir por eso que alguien con 49
 * países "está en el 3%" lo subestima muchísimo: ese 3% incluye tanto a quien
 * visitó cinco como a quien visitó cincuenta.
 *
 * Lo que se hace acá es asumir que la cola del país tiene la misma forma que la
 * mundial y escalarla por el punto que sí se conoce. Es una estimación, no un
 * dato medido, y la copy lo dice.
 */
export function estimateCountryTail(
  visited: number,
  anchor: { countries: number; share: number },
): number | null {
  if (visited < anchor.countries) return null;

  const worldAtAnchor = worldTailShare(anchor.countries);
  if (worldAtAnchor <= 0) return null;

  const ratio = anchor.share / worldAtAnchor;
  return Math.min(100, worldTailShare(visited) * ratio);
}

/**
 * Arma la frase de la porción, sin fingir precisión que no tiene. Por debajo del
 * 0,1% se cambia "en el" por "dentro del": el número es un techo, no una medida.
 */
export function describeTail(percent: number): string {
  if (percent < 0.1) return "dentro del 0,1%";
  if (percent < 1)
    return `en el ${percent.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;
  return `en el ${Math.round(percent)}%`;
}

export function computeStats(visitedIds: Iterable<string>): TripStats {
  const perContinent = new Map<Continent, number>();
  let visited = 0;

  for (const id of visitedIds) {
    const country = COUNTRIES[id];
    if (!country?.countable || !isContinent(country.region)) continue;
    visited++;
    perContinent.set(country.region, (perContinent.get(country.region) ?? 0) + 1);
  }

  const continents: ContinentStat[] = CONTINENTS.map((continent) => {
    const total = COUNTRIES_PER_CONTINENT[continent];
    const count = perContinent.get(continent) ?? 0;
    return {
      continent,
      visited: count,
      total,
      percent: (count / total) * 100,
    };
  }).sort(
    (a, b) =>
      // De más explorado a menos. Los empates se resuelven por cobertura y
      // después por el orden fijo de CONTINENTS (los ids no son texto para
      // mostrar, así que no tiene sentido compararlos alfabéticamente).
      b.visited - a.visited ||
      b.percent - a.percent ||
      CONTINENTS.indexOf(a.continent) - CONTINENTS.indexOf(b.continent),
  );

  const strongest = continents.reduce<ContinentStat | null>(
    (best, current) =>
      current.visited > 0 && (!best || current.percent > best.percent) ? current : best,
    null,
  );

  return {
    visited,
    total: WORLD_TOTAL,
    worldPercent: (visited / WORLD_TOTAL) * 100,
    beatsPercent: beatsPercent(visited),
    continents,
    strongest,
  };
}

export interface Hook {
  /** Cambia cuando cambia el mensaje, para animar solo en ese momento */
  id: string;
  headline: string;
  detail: string;
}

/**
 * El gancho de ego que aparece a medida que el usuario marca países. Escala en
 * intensidad y recién arriba de cierto umbral empieza a hablar de guardar.
 */
export function buildHook(stats: TripStats): Hook | null {
  const { visited, beatsPercent: beats, strongest } = stats;

  if (visited === 0) return null;

  if (visited < 3) {
    return {
      id: "arranque",
      headline: `${visited} ${visited === 1 ? "país marcado" : "países marcados"}`,
      detail: "Seguí marcando. A los 3 países te decimos cómo te comparás con el resto.",
    };
  }

  if (visited < 10) {
    return {
      id: "primer-percentil",
      headline: `Ya visitaste más países que el ${beats}% del mundo`,
      detail: `Con ${visited} países estás arriba del promedio global, que ronda los 5.`,
    };
  }

  if (visited < 25) {
    return {
      id: "arriba-del-promedio",
      // `beats` es a cuánta gente le ganás, así que el tramo de arriba es el
      // complemento: ganarle al 80% te deja en el 20% más viajado.
      headline: `Estás en el ${Math.max(1, 100 - beats)}% más viajado del planeta`,
      detail: strongest
        ? `Tu continente más explorado es ${strongest.continent}, con ${strongest.percent.toFixed(0)}% cubierto.`
        : "Un tercio de la gente no salió nunca de su país.",
    };
  }

  if (visited < 50) {
    return {
      id: "top-5",
      headline: `${visited} países te ponen en el top ${Math.max(1, 100 - beats)}% mundial`,
      detail: "El percentil 95 en países ricos arranca cerca de los 25 países. Ya lo pasaste.",
    };
  }

  if (visited < 100) {
    return {
      id: "top-1",
      headline: `Top 1% del planeta`,
      detail: `Pasar los 50 países te deja arriba del 99% de la gente. Vas ${visited}.`,
    };
  }

  return {
    id: "leyenda",
    headline: `${visited} países. Te faltan ${stats.total - visited}`,
    detail: "A esta altura sos más fácil de encontrar por escala que por país.",
  };
}

/** Umbral a partir del cual conviene ofrecer guardar el progreso (fase 2). */
export const SAVE_PROMPT_THRESHOLD = 8;
