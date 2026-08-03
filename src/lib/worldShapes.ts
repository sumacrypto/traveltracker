"use client";

import { useEffect, useState } from "react";
import { buildShapes, type WorldMapData } from "./geo";

/**
 * La topología pesa ~750 KB y la necesitan tanto el mapa como la tarjeta que se
 * comparte. Se cachea a nivel de módulo para bajarla y proyectarla una sola vez
 * por sesión.
 */
let cached: WorldMapData | null = null;
let inFlight: Promise<WorldMapData> | null = null;

export function loadWorldShapes(): Promise<WorldMapData> {
  if (cached) return Promise.resolve(cached);
  if (inFlight) return inFlight;

  inFlight = fetch("/geo/countries-50m.json")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((topology) => {
      cached = buildShapes(topology);
      return cached;
    })
    .catch((error: unknown) => {
      // Si falla, se limpia para que un reintento vuelva a pedirla.
      inFlight = null;
      throw error;
    });

  return inFlight;
}

export interface WorldShapesState {
  map: WorldMapData | null;
  error: boolean;
}

export function useWorldShapes(): WorldShapesState {
  const [state, setState] = useState<WorldShapesState>(() => ({
    map: cached,
    error: false,
  }));

  useEffect(() => {
    if (cached) return;
    let active = true;

    loadWorldShapes()
      .then((map) => {
        if (active) setState({ map, error: false });
      })
      .catch(() => {
        if (active) setState({ map: null, error: true });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
