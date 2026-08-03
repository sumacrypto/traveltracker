"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Destino remoto opcional. Mientras no haya sesión es null y el progreso vive
 * solo en localStorage; cuando alguien entra a su cuenta, AccountSync lo
 * registra y cada cambio se replica.
 */
export interface RemoteSink {
  markCountry: (geometryId: string) => void;
  unmarkCountry: (geometryId: string) => void;
  markSubdivision: (countryCode: string, subdivisionCode: string) => void;
  unmarkSubdivision: (countryCode: string, subdivisionCode: string) => void;
}

let sink: RemoteSink | null = null;

export function setRemoteSink(next: RemoteSink | null) {
  sink = next;
}

/** Clave usada para las subdivisiones dentro del estado local. */
export function subdivisionKey(countryCode: string, subdivisionCode: string) {
  return `${countryCode}:${subdivisionCode}`;
}

interface TripState {
  /** Claves = id de geometría del TopoJSON. El valor siempre es true. */
  visited: Record<string, true>;
  /** Claves = "AR:AR-B". Separado porque no suman al total de 195. */
  subdivisions: Record<string, true>;
  /**
   * ISO alpha-2 del país de origen. Vive acá y no solo en el perfil para que la
   * comparación con los pares funcione sin cuenta: es el gancho más fuerte y
   * pedirlo detrás de un login lo desperdicia.
   */
  homeCountry: string | null;
  /** Países que la persona abrió en detalle, en el orden en que los agregó. */
  detailCountries: string[];
  /** false hasta que se leyó localStorage: evita pintar un mapa vacío y saltar. */
  hydrated: boolean;
  setHomeCountry: (code: string | null) => void;
  addDetailCountry: (code: string) => void;
  removeDetailCountry: (code: string) => void;
  toggle: (geometryId: string) => void;
  toggleSubdivision: (countryCode: string, subdivisionCode: string) => void;
  /** Reemplaza el estado completo, para el merge al iniciar sesión. */
  replaceAll: (visited: Record<string, true>, subdivisions: Record<string, true>) => void;
  clear: () => void;
}

export const useTrip = create<TripState>()(
  persist(
    (set, get) => ({
      visited: {},
      subdivisions: {},
      homeCountry: null,
      detailCountries: [],
      hydrated: false,

      setHomeCountry: (code) => set({ homeCountry: code }),

      addDetailCountry: (code) =>
        set((state) =>
          state.detailCountries.includes(code)
            ? state
            : { detailCountries: [...state.detailCountries, code] },
        ),

      removeDetailCountry: (code) =>
        set((state) => ({
          detailCountries: state.detailCountries.filter((item) => item !== code),
          // Sacar el país de la lista también borra lo que se había marcado
          // adentro: dejarlo colgado haría que el contador general no cierre.
          subdivisions: Object.fromEntries(
            Object.entries(state.subdivisions).filter(([key]) => !key.startsWith(`${code}:`)),
          ) as Record<string, true>,
        })),

      toggle: (geometryId) => {
        const next = { ...get().visited };
        if (next[geometryId]) {
          delete next[geometryId];
          sink?.unmarkCountry(geometryId);
        } else {
          next[geometryId] = true;
          sink?.markCountry(geometryId);
        }
        set({ visited: next });
      },

      toggleSubdivision: (countryCode, subdivisionCode) => {
        const key = subdivisionKey(countryCode, subdivisionCode);
        const next = { ...get().subdivisions };
        if (next[key]) {
          delete next[key];
          sink?.unmarkSubdivision(countryCode, subdivisionCode);
        } else {
          next[key] = true;
          sink?.markSubdivision(countryCode, subdivisionCode);
        }
        set({ subdivisions: next });
      },

      replaceAll: (visited, subdivisions) => set({ visited, subdivisions }),
      clear: () => set({ visited: {}, subdivisions: {}, detailCountries: [] }),
    }),
    {
      name: "travel-tracker:visited",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        visited: state.visited,
        subdivisions: state.subdivisions,
        homeCountry: state.homeCountry,
        detailCountries: state.detailCountries,
      }),
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<TripState>;
        // v1 no tenía subdivisiones; v2, país de origen; v3, lista de detalle.
        return {
          ...state,
          subdivisions: version < 2 ? {} : (state.subdivisions ?? {}),
          homeCountry: version < 3 ? null : (state.homeCountry ?? null),
          // Los países que ya tenían divisiones marcadas se rescatan solos.
          detailCountries:
            version < 4
              ? [...new Set(Object.keys(state.subdivisions ?? {}).map((k) => k.split(":")[0]))]
              : (state.detailCountries ?? []),
        };
      },
      onRehydrateStorage: () => () => {
        useTrip.setState({ hydrated: true });
      },
    },
  ),
);
