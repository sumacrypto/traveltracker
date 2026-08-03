import { geoAlbersUsa, geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { SubdivisionSet, SubdivisionUnit } from "@/data/subdivisions";

/** Caja máxima donde se encuadra el país antes de recortar al contorno real. */
const MAX_WIDTH = 900;
const MAX_HEIGHT = 700;
const PADDING = 8;

export interface SubdivisionShape {
  /** ISO 3166-2 de la unidad */
  key: string;
  d: string;
  unit: SubdivisionUnit | null;
}

export interface SubdivisionMapData {
  shapes: SubdivisionShape[];
  /** Nombres de cada división, que vienen dentro del archivo del país. */
  units: Record<string, SubdivisionUnit>;
  /** Medidas reales del país proyectado: el viewBox toma su forma. */
  width: number;
  height: number;
}

interface Topology {
  objects: Record<string, unknown>;
  units?: Record<string, SubdivisionUnit>;
}

export function buildSubdivisionShapes(
  topology: unknown,
  set: SubdivisionSet,
): SubdivisionMapData {
  const topo = topology as Topology;
  const units = topo.units ?? {};
  const collection = feature(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    topo as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    topo.objects[set.objectKey] as any,
  ) as unknown as FeatureCollection<Geometry, Record<string, never>>;

  // Albers USA reubica Alaska y Hawái para que entren en el mismo encuadre; es
  // la proyección que la gente espera ver de Estados Unidos. Para el resto,
  // Mercator es lo que se usa para mapas de un solo país.
  const projection = set.projection === "albersUsa" ? geoAlbersUsa() : geoMercator();
  projection.fitExtent(
    [
      [PADDING, PADDING],
      [MAX_WIDTH - PADDING, MAX_HEIGHT - PADDING],
    ],
    collection as GeoPermissibleObjects,
  );

  // El viewBox se recorta al contorno real. Sin esto un país angosto y largo
  // como Argentina queda diminuto en el medio de un lienzo apaisado.
  const measure = geoPath(projection);
  const [[x0, y0], [x1, y1]] = measure.bounds(collection as GeoPermissibleObjects);
  const [tx, ty] = projection.translate();
  projection.translate([tx - x0 + PADDING, ty - y0 + PADDING]);

  const path = geoPath(projection);
  const shapes: SubdivisionShape[] = [];

  for (const f of collection.features) {
    const d = path(f as GeoPermissibleObjects);
    // Albers USA no proyecta los territorios de ultramar: devuelve un path vacío
    // y esas unidades simplemente no se dibujan.
    if (!d) continue;
    const key = String(f.id);
    shapes.push({ key, d, unit: units[key] ?? null });
  }

  return {
    shapes,
    units,
    width: Math.round(x1 - x0 + PADDING * 2),
    height: Math.round(y1 - y0 + PADDING * 2),
  };
}

const cache = new Map<string, SubdivisionMapData>();
const inFlight = new Map<string, Promise<SubdivisionMapData>>();

export function loadSubdivisionShapes(set: SubdivisionSet): Promise<SubdivisionMapData> {
  const cached = cache.get(set.countryCode);
  if (cached) return Promise.resolve(cached);

  const pending = inFlight.get(set.countryCode);
  if (pending) return pending;

  const request = fetch(set.file)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((topology) => {
      const data = buildSubdivisionShapes(topology, set);
      cache.set(set.countryCode, data);
      return data;
    })
    .catch((error: unknown) => {
      inFlight.delete(set.countryCode);
      throw error;
    });

  inFlight.set(set.countryCode, request);
  return request;
}
