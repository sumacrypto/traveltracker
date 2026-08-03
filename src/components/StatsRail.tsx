"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowCounterClockwise, ShareNetwork, UploadSimple } from "@phosphor-icons/react";
import AnimatedNumber from "./AnimatedNumber";
import type { Hook, TripStats } from "@/lib/stats";
import { BENCHMARK_SOURCES } from "@/data/benchmarks";
import { track } from "@/lib/analytics";
import SavePromptCard from "./SavePromptCard";
import PeerComparison from "./PeerComparison";
import SubdivisionEntries from "./SubdivisionEntries";

interface StatsRailProps {
  stats: TripStats;
  hook: Hook | null;
  onReset: () => void;
  onShare: () => void;
  onSignIn: () => void;
  onOpenSubdivisions: (countryCode: string, countryName: string) => void;
  onFocusContinent: (continent: string) => void;
  onImport: () => void;
}

export default function StatsRail({
  stats,
  hook,
  onReset,
  onShare,
  onSignIn,
  onOpenSubdivisions,
  onFocusContinent,
  onImport,
}: StatsRailProps) {
  const reduce = useReducedMotion();
  // Borrar el progreso no se puede deshacer, así que el botón pide confirmación
  // en dos toques en vez de abrir un modal.
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    if (!confirmingReset) return;
    const timer = setTimeout(() => setConfirmingReset(false), 4000);
    return () => clearTimeout(timer);
  }, [confirmingReset]);

  // Saber en qué escalón del gancho cae la gente es lo que dice si la copy
  // engancha o no. Solo interesa cuando el mensaje cambia de escalón, no en cada
  // país marcado, así que la cantidad va por ref y fuera de las dependencias.
  const visitedCount = useRef(stats.visited);
  useEffect(() => {
    visitedCount.current = stats.visited;
  }, [stats.visited]);

  const hookId = hook?.id;
  useEffect(() => {
    if (hookId) track("hook_shown", { hook: hookId, countries: visitedCount.current });
  }, [hookId]);

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-5 lg:p-6">
      {/* La métrica principal es la cantidad de países: es el número del que la
          gente se acuerda y el que dice en voz alta. El porcentaje del mundo pasa
          a ser el contexto. */}
      <section>
        <div className="flex items-baseline gap-2">
          <AnimatedNumber
            value={stats.visited}
            className="font-mono text-6xl leading-none font-semibold tracking-tighter tabular-nums lg:text-7xl"
          />
          {/* El "de" va en la sans: en monoespaciada el espacio es tan ancho que
              parece un doble espacio. */}
          <span className="text-2xl leading-none font-semibold text-accent-ink lg:text-3xl">
            de <span className="font-mono tabular-nums">{stats.total}</span>
          </span>
        </div>
        <p className="mt-2.5 text-sm text-text-dim">
          países visitados ·{" "}
          <AnimatedNumber
            value={stats.worldPercent}
            decimals={1}
            className="font-mono tabular-nums text-text"
          />
          % del mundo
        </p>
      </section>

      {/* La `key` remonta la tarjeta cuando cambia el mensaje, así entra animada.
          Sin AnimatePresence a propósito: una animación de salida pendiente
          bloquearía el mensaje nuevo si el usuario marca países rápido. */}
      <motion.section
        key={hook?.id ?? "vacio"}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`surface p-4 ${hook ? "" : "border-dashed"}`}
      >
        {hook ? (
          <>
            <p className="text-[15px] leading-snug font-semibold text-accent-ink">{hook.headline}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-text-dim">{hook.detail}</p>
          </>
        ) : (
          <>
            <p className="text-[15px] leading-snug font-semibold">Todavía no marcaste nada</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-text-dim">
              Tocá los países del mapa donde estuviste. A los tres te decimos en qué percentil
              mundial caés.
            </p>
          </>
        )}
      </motion.section>

      <PeerComparison visited={stats.visited} onSignIn={onSignIn} />

      <SavePromptCard visited={stats.visited} onSignIn={onSignIn} />

      <section>
        <h2 className="text-xs font-semibold tracking-[0.14em] text-text-faint uppercase">
          Por continente
        </h2>
        <ul className="mt-3.5 flex flex-col gap-3.5">
          {stats.continents.map((row) => (
            // La lista se reordena al marcar países: sin `layout` las filas
            // saltarían de lugar de un frame al otro.
            <motion.li key={row.continent} layout={!reduce}>
              {/* Toda la fila encuadra el continente en el mapa: es la forma más
                  directa de pasar de la estadística a marcar lo que falta. */}
              <button
                type="button"
                onClick={() => onFocusContinent(row.continent)}
                title={`Ver ${row.continent} en el mapa`}
                className="group w-full text-left"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm transition-colors group-hover:text-accent-ink">
                    {row.continent}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-text-dim">
                    <span className={row.visited > 0 ? "text-text" : undefined}>{row.visited}</span>/
                    {row.total}
                  </span>
                </div>
              </button>
              <div className="mt-1.5 h-px w-full bg-ink-line">
                <motion.div
                  className="h-px bg-accent"
                  initial={false}
                  animate={{ width: `${row.percent}%` }}
                  transition={
                    reduce ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
                  }
                  style={{ transformOrigin: "left" }}
                />
              </div>
            </motion.li>
          ))}
        </ul>
      </section>

      <SubdivisionEntries onOpen={onOpenSubdivisions} />

      <div className="mt-auto flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={onShare}
          disabled={stats.visited === 0}
          className="flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition-opacity active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
        >
          <ShareNetwork size={16} weight="bold" />
          Compartir mi mapa
        </button>

        <button
          type="button"
          onClick={onImport}
          className="flex items-center justify-center gap-2 rounded-full border border-ink-line px-4 py-2.5 text-sm font-medium text-text-dim transition-colors hover:border-accent hover:text-accent-ink active:scale-[0.98]"
        >
          <UploadSimple size={15} weight="bold" />
          Importar de Google Maps
        </button>

        <button
          type="button"
          onClick={() => {
            if (confirmingReset) {
              onReset();
              setConfirmingReset(false);
            } else {
              setConfirmingReset(true);
            }
          }}
          disabled={stats.visited === 0}
          className={`flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 ${
            confirmingReset
              ? "border-accent text-accent-ink"
              : "border-ink-line text-text-dim hover:border-accent hover:text-accent-ink"
          }`}
        >
          <ArrowCounterClockwise size={15} weight="bold" />
          {confirmingReset ? `Borrar los ${stats.visited}, ¿seguro?` : "Empezar de cero"}
        </button>

        <p className="mt-1 text-[11px] leading-relaxed text-text-faint">
          Comparación contra datos públicos precargados ({BENCHMARK_SOURCES.map((s) => s.label).join(", ")}).
          Se reemplazan por promedios reales de usuarios cuando haya cuentas.
        </p>
      </div>
    </div>
  );
}
