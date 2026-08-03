import { geoContains, type GeoPermissibleObjects } from "d3-geo";
import type { CountryShape } from "./geo";

/**
 * Lector del historial de ubicación de Google.
 *
 * No existe API para leer el Timeline de alguien: Google nunca la abrió y en 2024
 * movió el historial al teléfono. La única vía es que la persona exporte su
 * archivo desde Takeout y lo suba acá.
 *
 * Todo el procesamiento pasa en el navegador. El archivo no sale del dispositivo:
 * es de lo más sensible que tiene una persona y no hay motivo para que lo veamos.
 */

export interface ImportResult {
  /** Puntos leídos del archivo, ya submuestreados. */
  points: number;
  /** Ids de geometría de los países encontrados. */
  countryIds: string[];
  /** Puntos que no cayeron en ningún país (mar, o coordenadas rotas). */
  unmatched: number;
}

type Point = [number, number];

/** Un punto por celda de ~0,5 grados: alcanza para saber en qué país estuvo. */
const GRID = 2;

function dedupe(points: Point[]): Point[] {
  const seen = new Set<string>();
  const result: Point[] = [];
  for (const [lon, lat] of points) {
    const key = `${Math.round(lon * GRID)}:${Math.round(lat * GRID)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push([lon, lat]);
  }
  return result;
}

/** "-34.6037°, -58.3816°" -> [-58.3816, -34.6037] */
function parseLatLngString(value: unknown): Point | null {
  if (typeof value !== "string") return null;
  const match = value.match(/(-?\d+\.?\d*)°?\s*,\s*(-?\d+\.?\d*)°?/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lon = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return [lon, lat];
}

function fromE7(lat: unknown, lon: unknown): Point | null {
  if (typeof lat !== "number" || typeof lon !== "number") return null;
  return [lon / 1e7, lat / 1e7];
}

/**
 * Google cambió el formato del export varias veces. Se soportan los tres que
 * circulan: Records.json, Semantic Location History y el Timeline.json nuevo que
 * exporta el teléfono.
 */
export function extractPoints(data: unknown): Point[] {
  const points: Point[] = [];

  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (!node || typeof node !== "object") return;

    const record = node as Record<string, unknown>;

    // Records.json y el histórico: latitudeE7 / longitudeE7
    const e7 = fromE7(record.latitudeE7, record.longitudeE7);
    if (e7) points.push(e7);

    // Timeline.json del teléfono: "12.34°, 56.78°" en varias claves posibles
    for (const key of ["latLng", "placeLocation", "point", "center"]) {
      const parsed = parseLatLngString(record[key]);
      if (parsed) points.push(parsed);
    }

    for (const value of Object.values(record)) {
      if (value && typeof value === "object") walk(value);
    }
  };

  walk(data);
  return dedupe(points);
}

/**
 * Resuelve en qué país cae cada punto. Primero descarta por bounding box, que es
 * una comparación de números, y recién ahí prueba la geometría real.
 */
export function matchCountries(points: Point[], shapes: CountryShape[]): ImportResult {
  const candidates = shapes.filter((shape) => shape.meta?.countable);

  // Bounding box geográfico de cada país, para el prefiltro.
  const boxes = candidates.map((shape) => {
    let west = 180;
    let south = 90;
    let east = -180;
    let north = -90;

    const visit = (coords: unknown): void => {
      if (Array.isArray(coords) && typeof coords[0] === "number") {
        const [lon, lat] = coords as Point;
        west = Math.min(west, lon);
        east = Math.max(east, lon);
        south = Math.min(south, lat);
        north = Math.max(north, lat);
        return;
      }
      if (Array.isArray(coords)) for (const item of coords) visit(item);
    };

    const geometry = shape.feature.geometry as { coordinates?: unknown; geometries?: unknown[] };
    if (geometry.coordinates) visit(geometry.coordinates);
    if (geometry.geometries) for (const g of geometry.geometries) visit((g as { coordinates: unknown }).coordinates);

    return { shape, west, south, east, north };
  });

  const found = new Set<string>();
  let unmatched = 0;

  for (const point of points) {
    const [lon, lat] = point;
    let hit = false;

    for (const box of boxes) {
      if (found.has(box.shape.key)) continue;
      if (lon < box.west || lon > box.east || lat < box.south || lat > box.north) continue;
      if (geoContains(box.shape.feature as GeoPermissibleObjects, point)) {
        found.add(box.shape.key);
        hit = true;
        break;
      }
    }

    // Si ya está marcado, igual cuenta como acierto: no es un punto perdido.
    if (!hit) {
      const inKnown = boxes.some(
        (box) =>
          found.has(box.shape.key) &&
          lon >= box.west &&
          lon <= box.east &&
          lat >= box.south &&
          lat <= box.north &&
          geoContains(box.shape.feature as GeoPermissibleObjects, point),
      );
      if (!inKnown) unmatched++;
    }
  }

  return { points: points.length, countryIds: [...found], unmatched };
}
