"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import AnimatedNumber from "./AnimatedNumber";
import { useTrip } from "@/lib/store";
import { computeStats } from "@/lib/stats";
import { useEgoHook } from "@/lib/useEgoHook";

/**
 * Pantalla de /stats. Fase 1: arranca solo con el panel hero (mismo dato que
 * ya arma StatsRail vía computeStats/useEgoHook, ahora de tamaño protagonista
 * en su propia ruta en vez de encajado en la barra lateral). Las fases
 * siguientes le agregan más secciones abajo (amigos, edad, país-a-país,
 * grupos) — por eso ya está armada como una pila vertical de `.surface`, no
 * como un layout de una sola tarjeta.
 */
export default function StatisticsScreen() {
  const t = useTranslations("statsPage");
  const tc = useTranslations("common.continents");
  const reduce = useReducedMotion();

  const visited = useTrip((state) => state.visited);
  const stats = useMemo(() => computeStats(Object.keys(visited)), [visited]);
  const hook = useEgoHook(stats);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 overflow-y-auto p-5 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("heading")}</h1>
        <p className="mt-1 text-sm text-text-dim">{t("subheading")}</p>
      </div>

      <section className="surface p-6 lg:p-8">
        <div className="flex items-baseline gap-2">
          <AnimatedNumber
            value={stats.visited}
            className="font-mono text-7xl leading-none font-semibold tracking-tighter tabular-nums lg:text-8xl"
          />
          <span className="text-2xl leading-none font-semibold text-accent-ink lg:text-3xl">
            {t("of")} <span className="font-mono tabular-nums">{stats.total}</span>
          </span>
        </div>
        <p className="mt-3 text-sm text-text-dim">
          {t("visitedLabel")} ·{" "}
          <AnimatedNumber
            value={stats.worldPercent}
            decimals={1}
            className="font-mono tabular-nums text-text"
          />
          {t("percentSuffix")}
        </p>
      </section>

      <motion.section
        key={hook?.id ?? "vacio"}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`surface p-5 ${hook ? "" : "border-dashed"}`}
      >
        {hook ? (
          <>
            <p className="text-base leading-snug font-semibold text-accent-ink">{hook.headline}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-text-dim">{hook.detail}</p>
          </>
        ) : (
          <>
            <p className="text-base leading-snug font-semibold">{t("emptyHeadline")}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-text-dim">{t("emptyDetail")}</p>
          </>
        )}
      </motion.section>

      <section>
        <h2 className="text-xs font-semibold tracking-[0.14em] text-text-faint uppercase">
          {t("continentsHeading")}
        </h2>
        <ul className="mt-3.5 flex flex-col gap-3.5">
          {stats.continents.map((row) => (
            <motion.li key={row.continent} layout={!reduce}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm">{tc(row.continent)}</span>
                <span className="font-mono text-xs tabular-nums text-text-dim">
                  <span className={row.visited > 0 ? "text-text" : undefined}>{row.visited}</span>/
                  {row.total}
                </span>
              </div>
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
    </div>
  );
}
