import { geoMercator, geoPath } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry, Polygon } from "geojson";
import { COUNTRIES, type CountryMeta } from "@/data/countries";

/** Ancho del lienzo del mapa. El alto se calcula al proyectar. */
export const MAP_WIDTH = 900;

/** La Antártida no está en el recuento de 195 y deforma el encuadre. */
const ANTARCTICA_ID = "010";

/**
 * Encuadre del mundo habitado. Sin esto la proyección se ajusta al bounding box
 * de todas las geometrías, que incluye islas diminutas cerca del antimeridiano y
 * del extremo sur: el mapa termina chico y rodeado de océano vacío.
 *
 * De 84°N (norte de Groenlandia) a 56°S (bien debajo de Ushuaia) entra todo lo
 * que la gente marca. Lo que quede fuera se sigue dibujando y se alcanza con zoom.
 */
const HABITABLE_FRAME: Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [-180, -56],
      [180, -56],
      [180, 84],
      [-180, 84],
      [-180, -56],
    ],
  ],
};

const PADDING = 4;

/** [oeste, sur, este, norte] de cada continente, en grados. */
const CONTINENT_FRAMES: Record<string, [number, number, number, number]> = {
  "África": [-19, -36, 53, 38],
  "América": [-170, -56, -33, 73],
  Asia: [25, -11, 150, 62],
  Europa: [-26, 34, 46, 71],
  "Oceanía": [110, -48, 180, -5],
};

/**
 * Se proyectan las cuatro esquinas a mano en vez de armar un polígono: d3 aplica
 * la regla de orientación esférica y un rectángulo con los vértices en el orden
 * "equivocado" se interpreta como todo el globo menos ese rectángulo.
 */
function projectBox(
  projection: (point: [number, number]) => [number, number] | null,
  [west, south, east, north]: [number, number, number, number],
): Bounds | null {
  const corners: [number, number][] = [
    [west, south],
    [east, south],
    [east, north],
    [west, north],
  ];

  const points = corners.map((corner) => projection(corner)).filter(Boolean) as [number, number][];
  if (points.length < 4) return null;

  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  return [
    [Math.min(...xs), Math.min(...ys)],
    [Math.max(...xs), Math.max(...ys)],
  ];
}

export type Bounds = [[number, number], [number, number]];

export interface CountryShape {
  /** id de geometría (ISO numérico) o el nombre cuando no tiene ISO */
  key: string;
  /** path SVG ya proyectado, para el planisferio */
  d: string;
  meta: CountryMeta | null;
  /** bounds proyectados, para poder encuadrar un país */
  bounds: Bounds;
  /**
   * Geometría sin proyectar. El globo la necesita porque reproyecta en cada
   * frame al girar, y el importador para saber en qué país cae un punto.
   */
  feature: Feature<Geometry>;
}

export interface WorldMapData {
  shapes: CountryShape[];
  width: number;
  /** Alto real del encuadre proyectado: el viewBox lo usa tal cual. */
  height: number;
  /** Bounds proyectados de cada continente, para encuadrarlo de un click. */
  continentBounds: Record<string, Bounds>;
}

type WorldTopology = Topology<{ countries: GeometryCollection<{ name: string }> }>;

export function buildShapes(topology: WorldTopology): WorldMapData {
  const collection = feature(
    topology,
    topology.objects.countries,
  ) as unknown as FeatureCollection<Geometry, { name: string }>;

  const features = collection.features.filter((f) => String(f.id) !== ANTARCTICA_ID);

  // Mercator y no Natural Earth: el planisferio de Natural Earth es 2,3:1 y deja
  // media pantalla de aire en un panel casi cuadrado. Mercator recortado al mundo
  // habitado da 1,5:1, llena mucho mejor, y además es la proyección que todo el
  // mundo reconoce de la web. El costo es que exagera Groenlandia y Rusia.
  const projection = geoMercator();
  projection.fitWidth(MAP_WIDTH - PADDING * 2, HABITABLE_FRAME as GeoPermissibleObjects);

  // fitWidth deja el marco donde caiga; acá se lo lleva a la esquina (PADDING,
  // PADDING) para que el viewBox lo contenga exacto y quede centrado en los dos
  // ejes.
  const measure = geoPath(projection);
  const [[frameLeft, frameTop], [, frameBottom]] = measure.bounds(
    HABITABLE_FRAME as GeoPermissibleObjects,
  );
  const [tx, ty] = projection.translate();
  projection.translate([tx - frameLeft + PADDING, ty - frameTop + PADDING]);

  const height = Math.round(frameBottom - frameTop + PADDING * 2);
  const path = geoPath(projection);

  // Natural Earth trae algunos territorios como geometrías separadas con el mismo
  // código ISO (Australia + Ashmore y Cartier). Se fusionan en un solo path para
  // que cada país sea un único elemento clickeable.
  const byKey = new Map<string, CountryShape>();
  for (const f of features) {
    const d = path(f as GeoPermissibleObjects);
    if (!d) continue;
    const key = f.id !== undefined ? String(f.id) : f.properties.name;
    const bounds = path.bounds(f as GeoPermissibleObjects);
    const existing = byKey.get(key);

    if (existing) {
      existing.d += d;
      // Dos geometrías con el mismo ISO se unen en una sola para el globo.
      existing.feature = {
        type: "Feature",
        id: key,
        properties: {},
        geometry: {
          type: "GeometryCollection",
          geometries: [existing.feature.geometry, f.geometry],
        },
      } as Feature<Geometry>;
      existing.bounds = [
        [
          Math.min(existing.bounds[0][0], bounds[0][0]),
          Math.min(existing.bounds[0][1], bounds[0][1]),
        ],
        [
          Math.max(existing.bounds[1][0], bounds[1][0]),
          Math.max(existing.bounds[1][1], bounds[1][1]),
        ],
      ];
      continue;
    }

    byKey.set(key, {
      key,
      d,
      meta: COUNTRIES[key] ?? null,
      bounds,
      feature: f as Feature<Geometry>,
    });
  }

  // Marcos fijos y no la unión de los países del continente: Rusia figura como
  // Europa y llega hasta Kamchatka, así que el bounding box real de "Europa"
  // abarca casi todo el planisferio. Estos son los recortes de atlas.
  const continentBounds: Record<string, Bounds> = {};
  for (const [continent, box] of Object.entries(CONTINENT_FRAMES)) {
    const bounds = projectBox(projection, box);
    if (bounds) continentBounds[continent] = bounds;
  }

  // Los buffers invisibles de países vecinos se superponen (ver CountryPath):
  // en un cluster denso como los Balcanes o el Benelux, sin este orden el país
  // más chico queda tapado por el de al lado y su click nunca le llega. Pintando
  // los países grandes primero y los chicos al final, el buffer del chico gana
  // el empate en su propio centro.
  const shapes = [...byKey.values()].sort((a, b) => boundsArea(b.bounds) - boundsArea(a.bounds));

  return { shapes, width: MAP_WIDTH, height, continentBounds };
}

function boundsArea([[x0, y0], [x1, y1]]: Bounds): number {
  return (x1 - x0) * (y1 - y0);
}

export type { Feature };
