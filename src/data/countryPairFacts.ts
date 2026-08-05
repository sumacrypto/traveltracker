/**
 * Hechos "Sabías que" país a país: a diferencia de benchmarks.ts (un solo
 * dato genérico por país de origen, "cuántos viajaron"), acá el dato es
 * bilateral — a qué destino puntual fue esa gente.
 *
 * Archivo estático curado a mano, no tabla: se actualiza poco y cada fila
 * tiene que poder rastrearse a una fuente real y específica (instituto de
 * estadística, ministerio de turismo, Eurostat/UNWTO). Ningún número acá es
 * estimado o inventado para rellenar un país — cuando no hay dato bilateral
 * confiable, el país de origen simplemente no tiene entradas (ver el mapa de
 * gaps al final), y countryPairs.ts/CountryFactsCard.tsx tienen que mostrar
 * eso explícito, nunca en silencio.
 */

export type PairMetric =
  /** % de los viajes/salidas al exterior de `originCode` que fueron a `destinationCode`. */
  | "outboundShare"
  /** % de los arribos extranjeros de `destinationCode` que vienen de `originCode` (se usa cuando el país de origen no publica el desglose por destino, pero el destino sí publica el desglose por nacionalidad). */
  | "arrivalsShare";

export interface CountryPairFact {
  originCode: string;
  destinationCode: string;
  metric: PairMetric;
  percent: number;
  year: number;
  source: string;
}

/**
 * Los 11 países ya cargados en benchmarks.ts más los hispanohablantes que
 * probablemente sean la base real de usuarios (decisión confirmada con el
 * usuario). No todos tienen datos bilaterales publicados con la misma
 * solidez: donde la fuente es una estimación de mercado (no un instituto
 * oficial) o el país de destino solo publica datos de arribos (no de
 * salidas), el `source` lo dice explícito.
 */
export const COUNTRY_PAIR_FACTS: CountryPairFact[] = [
  // Estados Unidos
  {
    originCode: "US",
    destinationCode: "MX",
    metric: "outboundShare",
    percent: 37,
    year: 2024,
    source: "NTTO (Dept. de Comercio de EE.UU.), U.S. Outbound Travelers Characteristics",
  },
  {
    originCode: "US",
    destinationCode: "CA",
    metric: "outboundShare",
    percent: 13.1,
    year: 2024,
    source: "NTTO (Dept. de Comercio de EE.UU.), U.S. Outbound Travelers Characteristics",
  },

  // Colombia
  {
    originCode: "CO",
    destinationCode: "US",
    metric: "outboundShare",
    percent: 29,
    year: 2025,
    source: "ANATO, sobre datos de Migración Colombia (primer semestre)",
  },
  {
    originCode: "CO",
    destinationCode: "ES",
    metric: "outboundShare",
    percent: 14.7,
    year: 2025,
    source: "ANATO, sobre datos de Migración Colombia (primer semestre)",
  },
  {
    originCode: "CO",
    destinationCode: "PA",
    metric: "outboundShare",
    percent: 10.7,
    year: 2025,
    source: "ANATO, sobre datos de Migración Colombia (primer semestre)",
  },

  // Perú
  {
    originCode: "PE",
    destinationCode: "CL",
    metric: "outboundShare",
    percent: 31.8,
    year: 2023,
    source: "Mincetur (enero–octubre)",
  },
  {
    originCode: "PE",
    destinationCode: "US",
    metric: "outboundShare",
    percent: 13.2,
    year: 2023,
    source: "Mincetur (enero–octubre)",
  },
  {
    originCode: "PE",
    destinationCode: "BO",
    metric: "outboundShare",
    percent: 7,
    year: 2023,
    source: "Mincetur (enero–octubre)",
  },

  // Argentina
  {
    originCode: "AR",
    destinationCode: "CL",
    metric: "outboundShare",
    percent: 28,
    year: 2024,
    source: "INDEC, Encuesta de Turismo Internacional (4to trimestre)",
  },
  {
    originCode: "AR",
    destinationCode: "BR",
    metric: "outboundShare",
    percent: 22.6,
    year: 2024,
    source: "INDEC, Encuesta de Turismo Internacional (4to trimestre)",
  },
  {
    originCode: "AR",
    destinationCode: "UY",
    metric: "outboundShare",
    percent: 15.6,
    year: 2024,
    source: "INDEC, Encuesta de Turismo Internacional (4to trimestre)",
  },

  // Chile
  {
    originCode: "CL",
    destinationCode: "AR",
    metric: "outboundShare",
    percent: 45.1,
    year: 2023,
    source: "SERNATUR, Perfil del Turista Receptivo y Emisivo",
  },
  {
    originCode: "CL",
    destinationCode: "PE",
    metric: "outboundShare",
    percent: 16.2,
    year: 2023,
    source: "SERNATUR, Perfil del Turista Receptivo y Emisivo",
  },

  // Uruguay
  {
    originCode: "UY",
    destinationCode: "AR",
    metric: "outboundShare",
    percent: 80.2,
    year: 2023,
    source: "Ministerio de Turismo de Uruguay / Dirección Nacional de Migración",
  },
  {
    originCode: "UY",
    destinationCode: "BR",
    metric: "outboundShare",
    percent: 14.4,
    year: 2023,
    source: "Ministerio de Turismo de Uruguay / Dirección Nacional de Migración",
  },

  // Suecia — Eurostat marca estos valores con su propio indicador de baja
  // fiabilidad estadística (muestra chica), pero siguen siendo el dato
  // oficial publicado, no una estimación nuestra.
  {
    originCode: "SE",
    destinationCode: "DE",
    metric: "outboundShare",
    percent: 13.4,
    year: 2024,
    source: "Eurostat, tour_dem_ttw (dato de baja fiabilidad estadística)",
  },
  {
    originCode: "SE",
    destinationCode: "ES",
    metric: "outboundShare",
    percent: 10.4,
    year: 2024,
    source: "Eurostat, tour_dem_ttw (dato de baja fiabilidad estadística)",
  },

  // Países Bajos
  {
    originCode: "NL",
    destinationCode: "DE",
    metric: "outboundShare",
    percent: 17,
    year: 2023,
    source: "CBS (Statistics Netherlands), Vakanties van Nederlanders",
  },
  {
    originCode: "NL",
    destinationCode: "FR",
    metric: "outboundShare",
    percent: 13.9,
    year: 2023,
    source: "CBS (Statistics Netherlands), Vakanties van Nederlanders",
  },
  {
    originCode: "NL",
    destinationCode: "ES",
    metric: "outboundShare",
    percent: 10.1,
    year: 2023,
    source: "CBS (Statistics Netherlands), Vakanties van Nederlanders",
  },

  // España
  {
    originCode: "ES",
    destinationCode: "FR",
    metric: "outboundShare",
    percent: 15.4,
    year: 2024,
    source: "Eurostat, tour_dem_ttw (a partir de FAMILITUR/INE)",
  },
  {
    originCode: "ES",
    destinationCode: "PT",
    metric: "outboundShare",
    percent: 13.7,
    year: 2024,
    source: "Eurostat, tour_dem_ttw (a partir de FAMILITUR/INE)",
  },
  {
    originCode: "ES",
    destinationCode: "IT",
    metric: "outboundShare",
    percent: 13.5,
    year: 2024,
    source: "Eurostat, tour_dem_ttw (a partir de FAMILITUR/INE)",
  },

  // Sudáfrica — Stats SA no releva salidas de residentes por destino, así
  // que acá el dato es al revés (arrivalsShare): qué porción de quienes
  // llegan a esos países vecinos son sudafricanos.
  {
    originCode: "ZA",
    destinationCode: "NA",
    metric: "arrivalsShare",
    percent: 40.5,
    year: 2023,
    source: "Ministerio de Ambiente, Bosques y Turismo de Namibia, Tourist Statistical Report",
  },
  {
    originCode: "ZA",
    destinationCode: "BW",
    metric: "arrivalsShare",
    percent: 33.3,
    year: 2023,
    source: "Statistics Botswana, International Visitor Arrivals Stats Brief",
  },

  // India
  {
    originCode: "IN",
    destinationCode: "NP",
    metric: "arrivalsShare",
    percent: 31.52,
    year: 2023,
    source: "Nepal Tourism Board",
  },
  {
    originCode: "IN",
    destinationCode: "AE",
    metric: "outboundShare",
    percent: 25.78,
    year: 2023,
    source: "Ministry of Tourism, Gobierno de India, India Tourism Statistics",
  },
  {
    originCode: "IN",
    destinationCode: "SA",
    metric: "outboundShare",
    percent: 11.02,
    year: 2023,
    source: "Ministry of Tourism, Gobierno de India, India Tourism Statistics",
  },

  // Indonesia
  {
    originCode: "ID",
    destinationCode: "MY",
    metric: "outboundShare",
    percent: 27.98,
    year: 2023,
    source: "BPS (Statistics Indonesia), Statistik Wisatawan Nasional",
  },
  {
    originCode: "ID",
    destinationCode: "SG",
    metric: "outboundShare",
    percent: 17,
    year: 2023,
    source: "BPS (Statistics Indonesia), Statistik Wisatawan Nasional",
  },
  {
    originCode: "ID",
    destinationCode: "SA",
    metric: "outboundShare",
    percent: 17.41,
    year: 2023,
    source: "BPS (Statistics Indonesia), Statistik Wisatawan Nasional — en gran parte peregrinos a La Meca",
  },

  // Nigeria — el dato hacia Reino Unido es una estimación de mercado
  // (GlobalData/Statista), no una cifra oficial: se lo marca así. El de
  // Ghana sí sale de una fuente oficial, del lado del destino.
  {
    originCode: "NG",
    destinationCode: "GB",
    metric: "outboundShare",
    percent: 32,
    year: 2022,
    source: "Statista / GlobalData, estimación de mercado (no es un dato oficial)",
  },
  {
    originCode: "NG",
    destinationCode: "GH",
    metric: "arrivalsShare",
    percent: 7.2,
    year: 2023,
    source: "Ghana Tourism Authority, Tourism Report",
  },

  // Sin entradas, a propósito, por falta de dato bilateral confiable:
  // - Kenia: KNBS solo publica arribos, no salidas por destino, y las cifras
  //   de terceros no se pudieron verificar contra una fuente primaria.
  // - Brasil: ni IBGE ni el Ministério do Turismo publican el desglose de
  //   turistas brasileños por país de destino.
  // - México: INEGI/DATATUR no publican el desglose de salidas por destino
  //   como porcentaje (solo totales).
];
