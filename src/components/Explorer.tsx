"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
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
import { buildHook, computeStats, type Hook } from "@/lib/stats";
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
  const t = useTranslations("explorer");
  const th = useTranslations("statsRail.hook");
  const tc = useTranslations("common.continents");

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
  const hookData = useMemo(() => buildHook(stats), [stats]);

  // buildHook() no tiene locale (no es un componente), así que devuelve datos
  // crudos y acá se arma el texto final. "aboveAverage" es el único tramo con
  // dos mensajes de detalle posibles (con o sin continente destacado), el
  // resto interpola directo.
  const hook = useMemo<Hook | null>(() => {
    if (!hookData) return null;
    const { tier, values } = hookData;

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
  }, [hookData, th, tc]);

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
    // min-h en mobile a propósito: ahí la idea es que la página entera scrollee
    // de un tirón (ver el comentario en el mapa, más abajo). Pero sin un h fijo
    // en desktop, min-height nunca frena: el contenedor crece con el contenido
    // y termina siendo TODA la página la que scrollea, incluido el mapa, en vez
    // de que el panel lateral scrollee solo dentro de su propio recuadro. Por
    // eso el número de países arriba del panel desaparecía al bajar: nunca
    // hubo un scroll interno donde pudiera quedar fijo.
    <div className="flex min-h-[100dvh] flex-col lg:h-[100dvh]">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-ink-line px-4 lg:gap-6 lg:px-6">
        <div className="flex shrink-0 items-center gap-2">
          <GlobeHemisphereWest size={22} weight="fill" className="text-accent" />
          <span className="text-[15px] font-semibold tracking-tight">{t("appName")}</span>
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
        </main>

        <aside className="lg:min-h-0 lg:overflow-y-auto">
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
        reason={stats.visited > 0 ? t("authReason", { count: stats.visited }) : undefined}
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
