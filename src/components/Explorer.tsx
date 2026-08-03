"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { GlobeHemisphereWest } from "@phosphor-icons/react";
import CountrySearch from "./CountrySearch";
import StatsRail from "./StatsRail";
import ThemeToggle from "./ThemeToggle";
import ShareCardDialog from "./ShareCardDialog";
import AccountButton from "./AccountButton";
import AccountSync from "./AccountSync";
import ReferralWelcome from "./ReferralWelcome";
import AuthDialog from "./AuthDialog";
import AccountDialog from "./AccountDialog";
import SubdivisionDialog from "./SubdivisionDialog";
import ImportDialog from "./ImportDialog";
import { useTrip } from "@/lib/store";
import { buildHook, computeStats } from "@/lib/stats";
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
  const visited = useTrip((state) => state.visited);
  const toggle = useTrip((state) => state.toggle);
  const clear = useTrip((state) => state.clear);

  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [drillDown, setDrillDown] = useState<{ code: string; name: string } | null>(null);
  const [view, setView] = useState<MapView>("flat");
  const [importOpen, setImportOpen] = useState(false);
  const focusNonce = useRef(0);

  const stats = useMemo(() => computeStats(Object.keys(visited)), [visited]);
  const hook = useMemo(() => buildHook(stats), [stats]);

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
    <div className="flex min-h-[100dvh] flex-col">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-ink-line px-4 lg:gap-6 lg:px-6">
        <div className="flex shrink-0 items-center gap-2">
          <GlobeHemisphereWest size={22} weight="fill" className="text-accent" />
          <span className="text-[15px] font-semibold tracking-tight">Dónde estuve</span>
        </div>

        <div className="ml-auto w-full max-w-64 min-w-0 lg:max-w-80">
          <CountrySearch visited={visited} onPick={handlePick} />
        </div>

        <ThemeToggle />
        <AccountButton
          onSignIn={() => setAuthOpen(true)}
          onOpenAccount={() => setAccountOpen(true)}
        />
      </header>

      <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[1fr_380px] lg:overflow-hidden">
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
        </main>

        <aside className="lg:overflow-y-auto">
          <StatsRail
            stats={stats}
            hook={hook}
            onReset={clear}
            onShare={openShare}
            onSignIn={() => setAuthOpen(true)}
            onOpenSubdivisions={(code, name) => setDrillDown({ code, name })}
            onImport={() => setImportOpen(true)}
            onFocusContinent={(continent) => {
              focusNonce.current += 1;
              setFocus({ kind: "continent", continent, nonce: focusNonce.current });
            }}
          />
        </aside>
      </div>

      <AccountSync />

      <ReferralWelcome onSignIn={() => setAuthOpen(true)} />

      <ShareCardDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        stats={stats}
        visited={visited}
        headline={hook?.headline ?? ""}
      />

      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        reason={
          stats.visited > 0
            ? `Guardá los ${stats.visited} países que marcaste y compará con tus amigos.`
            : undefined
        }
      />

      <AccountDialog open={accountOpen} onClose={() => setAccountOpen(false)} />

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />

      <SubdivisionDialog
        countryCode={drillDown?.code ?? null}
        countryName={drillDown?.name ?? ""}
        onClose={() => setDrillDown(null)}
      />
    </div>
  );
}
