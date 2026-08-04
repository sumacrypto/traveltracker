/**
 * Genera la data de subdivisiones (estados, provincias) para el drill-down.
 *
 *  - public/geo/subdivisions/<país>.json  topología servida como asset estático
 *  - src/data/subdivisions.ts             metadata y registro de países
 *
 * Fuente: Natural Earth admin-1 a 1:10m, que trae las divisiones de primer nivel
 * del mundo con su código ISO 3166-2 ya asignado. Es dominio público (CC0) y la
 * misma familia de datos que usa el mapa mundial.
 *
 * Se procesan TODOS los países que tengan al menos dos divisiones con ISO 3166-2.
 * Cada archivo se pide por separado y solo cuando alguien abre ese país, así que
 * tener muchos no encarece la primera visita.
 *
 * Correr con: npm run build:data
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { topology } from "topojson-server";

const SOURCE = new URL("../vendor/ne_10m_admin_1_states_provinces.json", import.meta.url);
const SOURCE_URL =
  "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/10m/cultural/ne_10m_admin_1_states_provinces.json";

/**
 * Cómo se llaman las divisiones según el tipo que declara Natural Earth. Se
 * usa el tipo dominante de cada país. Tupla: [plural es, singular es,
 * artículo es, plural en, singular en]. El inglés no necesita artículo (no
 * tiene género gramatical), así que el mismo template no le sirve a los dos
 * idiomas — ver subdivisionLabel() y la nota en SubdivisionDialog.tsx.
 */
const TYPE_LABELS = {
  Province: ["provincias", "provincia", "Las", "provinces", "province"],
  "Autonomous Province": ["provincias", "provincia", "Las", "provinces", "province"],
  State: ["estados", "estado", "Los", "states", "state"],
  District: ["distritos", "distrito", "Los", "districts", "district"],
  "Metropolitan Borough": ["distritos", "distrito", "Los", "districts", "district"],
  "London Borough": ["distritos", "distrito", "Los", "districts", "district"],
  Region: ["regiones", "región", "Las", "regions", "region"],
  "Statistical Region": ["regiones", "región", "Las", "regions", "region"],
  "Autonomous Region": ["regiones", "región", "Las", "regions", "region"],
  County: ["condados", "condado", "Los", "counties", "county"],
  "Administrative County": ["condados", "condado", "Los", "counties", "county"],
  "Urban county": ["condados", "condado", "Los", "counties", "county"],
  Department: ["departamentos", "departamento", "Los", "departments", "department"],
  "Metropolitan department": ["departamentos", "departamento", "Los", "departments", "department"],
  Municipality: ["municipios", "municipio", "Los", "municipalities", "municipality"],
  "Commune|Municipality": ["municipios", "municipio", "Los", "municipalities", "municipality"],
  Prefecture: ["prefecturas", "prefectura", "Las", "prefectures", "prefecture"],
  Governorate: ["gobernaciones", "gobernación", "Las", "governorates", "governorate"],
  "Municipality|Governarate": ["gobernaciones", "gobernación", "Las", "governorates", "governorate"],
  Parish: ["parroquias", "parroquia", "Las", "parishes", "parish"],
  "Autonomous Community": ["comunidades", "comunidad", "Las", "communities", "community"],
  Canton: ["cantones", "cantón", "Los", "cantons", "canton"],
  City: ["ciudades", "ciudad", "Las", "cities", "city"],
  "Highly Urbanized City": ["ciudades", "ciudad", "Las", "cities", "city"],
  Republic: ["repúblicas", "república", "Las", "republics", "republic"],
  Emirate: ["emiratos", "emirato", "Los", "emirates", "emirate"],
  Territory: ["territorios", "territorio", "Los", "territories", "territory"],
  Oblast: ["óblast", "óblast", "Los", "oblasts", "oblast"],
  Atoll: ["atolones", "atolón", "Los", "atolls", "atoll"],
  Division: ["divisiones", "división", "Las", "divisions", "division"],
};

const FALLBACK_LABEL = ["divisiones", "división", "Las", "divisions", "division"];

/**
 * Ajustes por país. Solo hace falta cuando la proyección por defecto no sirve o
 * cuando los nombres de Natural Earth no están en español.
 */
const OVERRIDES = {
  US: {
    projection: "albersUsa",
    names: {
      "New York": "Nueva York",
      "New Jersey": "Nueva Jersey",
      "New Mexico": "Nuevo México",
      "New Hampshire": "Nuevo Hampshire",
      "North Carolina": "Carolina del Norte",
      "South Carolina": "Carolina del Sur",
      "North Dakota": "Dakota del Norte",
      "South Dakota": "Dakota del Sur",
      "West Virginia": "Virginia Occidental",
      Louisiana: "Luisiana",
      Pennsylvania: "Pensilvania",
      Hawaii: "Hawái",
      "District of Columbia": "Distrito de Columbia",
    },
  },
};

/** Menos de dos divisiones no es un mapa, es un país de un solo color. */
const MIN_UNITS = 2;

// El dataset son 63 MB y no está en el repo. Si falta, se baja: hace falta para
// que el build corra en un servidor limpio sin subir el archivo al control de
// versiones.
if (!existsSync(SOURCE)) {
  console.log("· bajando el dataset de subdivisiones (63 MB, una sola vez)...");
  mkdirSync(new URL("../vendor/", import.meta.url), { recursive: true });

  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    console.error(
      `\nNo se pudo bajar el dataset (HTTP ${response.status}). Bajalo a mano con:\n\n  curl -L -o vendor/ne_10m_admin_1_states_provinces.json "${SOURCE_URL}"\n`,
    );
    process.exit(1);
  }

  writeFileSync(SOURCE, Buffer.from(await response.arrayBuffer()));
  console.log("· dataset descargado");
}

const world = JSON.parse(readFileSync(SOURCE, "utf8"));

const outDir = new URL("../public/geo/subdivisions/", import.meta.url);
mkdirSync(outDir, { recursive: true });
mkdirSync(new URL("../src/data/", import.meta.url), { recursive: true });

// Se limpia primero para que un país que deje de calificar no quede huérfano.
for (const file of readdirSync(outDir)) {
  if (file.endsWith(".json")) rmSync(new URL(file, outDir));
}

const byCountry = new Map();
for (const feature of world.features) {
  const code = feature.properties.iso_a2;
  const iso = feature.properties.iso_3166_2;
  if (!code || code === "-99" || !iso) continue;
  if (!byCountry.has(code)) byCountry.set(code, []);
  byCountry.get(code).push(feature);
}

const registry = {};
let totalBytes = 0;

for (const [code, features] of [...byCountry.entries()].sort()) {
  const override = OVERRIDES[code] ?? {};

  // Etiqueta según el tipo de división más frecuente del país.
  const typeCount = new Map();
  for (const f of features) {
    const type = f.properties.type_en;
    if (type) typeCount.set(type, (typeCount.get(type) ?? 0) + 1);
  }
  const dominant = [...typeCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const [label, singular, article, labelEn, singularEn] = TYPE_LABELS[dominant] ?? FALLBACK_LABEL;

  const units = {};
  const cleaned = [];

  for (const f of features) {
    const iso = f.properties.iso_3166_2;
    // Un mismo ISO puede venir partido en varias geometrías; la primera manda
    // para el nombre y el resto se fusiona al proyectar.
    if (!units[iso]) {
      const original = f.properties.name ?? iso;
      units[iso] = {
        code: iso,
        name: override.names?.[original] ?? original,
        countable: true,
      };
    }
    // Solo se conserva el id: las 60 propiedades de Natural Earth harían que el
    // archivo pese varias veces más que la geometría.
    cleaned.push({ type: "Feature", id: iso, properties: {}, geometry: f.geometry });
  }

  if (Object.keys(units).length < MIN_UNITS) continue;

  const topo = topology(
    { units: { type: "FeatureCollection", features: cleaned } },
    1e4, // cuantización: al tamaño en que se ve un país no se nota, y pesa la mitad
  );

  // Los nombres viajan dentro del archivo del país y no en el índice: sumados
  // son medio mega, y al bundle solo tiene que entrar la lista de países.
  topo.units = units;

  const fileName = `${code.toLowerCase()}.json`;
  const filePath = new URL(fileName, outDir);
  writeFileSync(filePath, JSON.stringify(topo));
  totalBytes += readFileSync(filePath).length;

  registry[code] = {
    countryCode: code,
    label,
    singular,
    article,
    labelEn,
    singularEn,
    projection: override.projection ?? "mercator",
    objectKey: "units",
    file: `/geo/subdivisions/${fileName}`,
    total: Object.keys(units).length,
  };
}

const header = `// GENERADO POR scripts/build-subdivision-data.mjs - no editar a mano.
// Fuente: Natural Earth admin-1 1:10m (dominio público).

export type SubdivisionProjection = "mercator" | "albersUsa";

export interface SubdivisionUnit {
  /** ISO 3166-2, por ejemplo AR-B o US-CA */
  code: string;
  name: string;
  /** Si suma al total del país */
  countable: boolean;
}

/**
 * Índice liviano: solo lo que hace falta para listar y buscar países. Los nombres
 * de cada división vienen dentro del TopoJSON del país, que se pide al abrirlo.
 */
export interface SubdivisionSet {
  /** ISO 3166-1 alpha-2 del país */
  countryCode: string;
  /** Plural en español para la copy: "estados", "provincias" */
  label: string;
  singular: string;
  /** "Los" o "Las", según el género del plural. Solo tiene sentido en español. */
  article: string;
  /** Plural/singular en inglés: "states"/"state", "provinces"/"province" */
  labelEn: string;
  singularEn: string;
  projection: SubdivisionProjection;
  objectKey: string;
  /** Ruta del TopoJSON dentro de public/ */
  file: string;
  /** Cantidad de unidades que cuentan para el porcentaje */
  total: number;
}

export const SUBDIVISION_SETS: Record<string, SubdivisionSet> = ${JSON.stringify(registry, null, 2)};

export function getSubdivisionSet(countryCode: string): SubdivisionSet | null {
  return SUBDIVISION_SETS[countryCode] ?? null;
}

/** Países que tienen drill-down disponible. */
export const SUBDIVISION_COUNTRY_CODES: string[] = Object.keys(SUBDIVISION_SETS);
`;

writeFileSync(new URL("../src/data/subdivisions.ts", import.meta.url), header);

console.log(
  `✓ ${Object.keys(registry).length} países con subdivisiones · ${
    Math.round((totalBytes / 1024 / 1024) * 10) / 10
  } MB en total`,
);
