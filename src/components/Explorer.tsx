"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import CountrySearch from "./CountrySearch";
import StatsRail from "./StatsRail";
import ShareCardDialog from "./ShareCardDialog";
import SubdivisionDialog from "./SubdivisionDialog";
import ImportDialog from "./ImportDialog";
import { useTrip } from "@/lib/store";
import { useUiDialogs } from "@/lib/uiState";
import { computeStats } from "@/lib/stats";
import { useEgoHook } from "@/lib/useEgoHook";
import { track } from "@/lib/analytics";
import { getCountry } from "@/lib/stats";
import type { MapFocus, MapView } from "./WorldMap";

// El mapa depende de d3 y del asset de 750 KB: no tiene sentido renderizarlo en
// el servidor ni bloquear el primer paint con él.
const WorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full p-2">
      <div className="skeleton h-full w-full rounded-[14px]" />
    </div>
  ),
});

export default function Explorer() {
  const openAuth = useUiDialogs((state) => state.openAuth);

  const visited = useTrip((state) => state.visited);
  const toggle = useTrip((state) => state.toggle);
  const clear = useTrip((state) => state.clear);

  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [drillDown, setDrillDown] = useState<{ code: string; name: string } | null>(null);
  const [view, setView] = useState<MapView>("flat");
  const [importOpen, setImportOpen] = useState(false);
  const focusNonce = useRef(0);

  const stats = useMemo(() => computeStats(Object.keys(visited)), [visited]);
  const hook = useEgoHook(stats);

  const handleToggle = useCallback(
    (key: string) => {
      const wasVisited = Boolean(useTrip.getState().visited[key]);
      toggle(key);
      track(wasVisited ? "country_unmarked" : "country_marked", {
        country: getCountry(key)?.code ?? key,
      });
    },
    [toggle],
  );

  const handlePick = useCallback(
    (key: string) => {
      handleToggle(key);
      // El nonce hace que el mapa confirme aunque se elija el mismo país dos
      // veces seguidas.
      focusNonce.current += 1;
      setFocus({ kind: "country", key, nonce: focusNonce.current });
    },
    [handleToggle],
  );

  const openShare = useCallback(() => {
    setShareOpen(true);
    track("share_opened", { countries: stats.visited });
  }, [stats.visited]);

  return (
    // El header y los diálogos de cuenta ahora viven en AppChrome.tsx (por
    // encima de esta ruta y de /stats); acá queda solo el par mapa+panel, que
    // es lo que hace de `flex-1` dentro del `flex-col` que arma AppChrome.
    <>
      <div className="flex flex-1 flex-col lg:grid lg:min-h-0 lg:grid-cols-[1fr_380px] lg:overflow-hidden">
        {/* En mobile el mapa tiene alto fijo para que el porcentaje y el gancho
            queden arriba del pliegue. El hijo va absoluto porque un height en
            porcentaje no resuelve contra un flex item de alto automático. */}
        <main className="relative h-[34svh] shrink-0 border-b border-ink-line lg:h-auto lg:min-h-0 lg:flex-1 lg:border-r lg:border-b-0">
          <div className="absolute inset-0">
            <WorldMap
              visited={visited}
              onToggle={handleToggle}
              focus={focus}
              view={view}
              onViewChange={setView}
            />
          </div>
          {/* El buscador se sacó del header compartido (es específico del mapa)
              y pasa a flotar acá arriba; se corre del botón de mapa/globo
              (arriba a la izquierda, dentro de WorldMap) con el padding
              izquierdo en mobile. */}
          <div className="pointer-events-none absolute top-3 right-3 left-16 z-20 lg:left-auto lg:w-72">
            <div className="pointer-events-auto">
              <CountrySearch visited={visited} onPick={handlePick} />
            </div>
          </div>
        </main>

        <aside className="lg:min-h-0 lg:overflow-y-auto">
          <StatsRail
            stats={stats}
            hook={hook}
            onReset={clear}
            onShare={openShare}
            onSignIn={openAuth}
            onOpenSubdivisions={(code, name) => setDrillDown({ code, name })}
            onImport={() => setImportOpen(true)}
            onFocusContinent={(continent) => {
              focusNonce.current += 1;
              setFocus({ kind: "continent", continent, nonce: focusNonce.current });
            }}
          />
        </aside>
      </div>

      <ShareCardDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        stats={stats}
        visited={visited}
        headline={hook?.headline ?? ""}
      />

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />

      <SubdivisionDialog
        countryCode={drillDown?.code ?? null}
        countryName={drillDown?.name ?? ""}
        onClose={() => setDrillDown(null)}
      />
    </>
  );
}
