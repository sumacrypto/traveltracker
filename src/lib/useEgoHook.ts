"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { buildHook, type Hook, type TripStats } from "./stats";

/**
 * buildHook() no tiene locale (no es un componente): devuelve datos crudos y
 * este hook arma el texto final. Antes vivía inline en Explorer.tsx; con el
 * panel hero de Estadísticas necesitando el mismo gancho, se separa acá para
 * que no haya dos copias del mismo armado de frases desincronizándose.
 */
export function useEgoHook(stats: TripStats): Hook | null {
  const th = useTranslations("statsRail.hook");
  const tc = useTranslations("common.continents");

  return useMemo(() => {
    const hookData = buildHook(stats);
    if (!hookData) return null;
    const { tier, values } = hookData;

    // "aboveAverage" es el único tramo con dos mensajes de detalle posibles
    // (con o sin continente destacado), el resto interpola directo.
    if (tier === "aboveAverage") {
      const detail = values.continentId
        ? th("aboveAverage.detailWithContinent", {
            continent: tc(values.continentId),
            coveragePercent: values.coveragePercent ?? 0,
          })
        : th("aboveAverage.detailWithoutContinent");
      return {
        id: tier,
        headline: th("aboveAverage.headline", { topPercent: values.topPercent ?? 0 }),
        detail,
      };
    }

    return {
      id: tier,
      headline: th(`${tier}.headline`, values),
      detail: th(`${tier}.detail`, values),
    };
  }, [stats, th, tc]);
}
