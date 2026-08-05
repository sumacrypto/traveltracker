"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAccount } from "@/lib/account";
import { useUiDialogs } from "@/lib/uiState";
import { SUPABASE_ENABLED } from "@/lib/supabase/client";
import { MIN_SAMPLE, fetchAgeCohortAverage, type AgeAverage } from "@/lib/peers";
import { PEW_TIER_SHARE, pewTravelTier } from "@/data/benchmarks";

interface AgeComparisonProps {
  visited: number;
}

/**
 * Comparación contra la gente de la misma edad. A diferencia de
 * PeerComparison, esta no puede funcionar sin cuenta: no existe un dato
 * publicado de "cuántos países visita alguien de 34 años" al que caer, el
 * único promedio posible sale de nuestros propios perfiles. Así que en vez de
 * inventar un número, cada estado sin dato dice exactamente qué falta (la
 * cuenta, el año de nacimiento, o más gente registrada) y ofrece el paso que
 * lo resuelve.
 */
export default function AgeComparison({ visited }: AgeComparisonProps) {
  const locale = useLocale();
  const t = useTranslations("statsPage.age");
  const user = useAccount((state) => state.user);
  const profile = useAccount((state) => state.profile);
  const openAuth = useUiDialogs((state) => state.openAuth);
  const openAccount = useUiDialogs((state) => state.openAccount);

  const birthYear = profile?.birth_year ?? null;

  const [loaded, setLoaded] = useState<{ birthYear: number; data: AgeAverage | null } | null>(null);

  useEffect(() => {
    if (!birthYear || !SUPABASE_ENABLED) return;
    let active = true;
    fetchAgeCohortAverage(birthYear)
      .then((data) => {
        if (active) setLoaded({ birthYear, data });
      })
      .catch(() => {
        if (active) setLoaded({ birthYear, data: null });
      });
    return () => {
      active = false;
    };
  }, [birthYear]);

  const cohort = loaded?.birthYear === birthYear ? loaded.data : null;

  const block = useMemo(() => {
    if (!user) {
      return {
        headline: t("signedOut.headline"),
        detail: t("signedOut.detail"),
        cta: { label: t("signedOut.cta"), onClick: openAuth },
        note: null,
      };
    }

    if (!birthYear) {
      return {
        headline: t("noBirthYear.headline"),
        detail: t("noBirthYear.detail"),
        cta: { label: t("noBirthYear.cta"), onClick: openAccount },
        note: null,
      };
    }

    if (!cohort) return null;

    // Los años van como texto a propósito: interpolados como número, el
    // formateador de cada idioma les mete separador de miles ("1.985").
    const from = String(cohort.fromYear);
    const to = String(cohort.toYear);

    if (!cohort.enough) {
      // No hay dato por edad al que caer (investigado a pedido explícito: Pew
      // mismo dice que la edad casi no cambia la experiencia de viaje, así
      // que no existe una curva por edad publicada). Mientras se junta
      // muestra propia, se muestra el dato real que sí existe — las
      // categorías del informe de Pew, con la salvedad explícita de que no
      // son por edad. Ver data/benchmarks.ts.
      const tier = pewTravelTier(visited);
      return {
        headline: t("notEnough.headline"),
        detail: t("notEnough.detail", {
          sampleSize: cohort.sampleSize,
          from,
          to,
          min: MIN_SAMPLE,
        }),
        // El diálogo de cuenta es donde vive el link de invitación: la forma
        // más directa de que la cohorte junte la muestra que le falta.
        cta: { label: t("notEnough.cta"), onClick: openAccount },
        note: {
          heading: t("worldNote.heading"),
          headline: t(`worldNote.${tier}`, { share: PEW_TIER_SHARE[tier] }),
          caveat: t("worldNote.caveat"),
        },
      };
    }

    const diff = visited - cohort.average;
    const rounded = Math.abs(Math.round(diff));

    return {
      headline:
        rounded === 0
          ? t("average.tie")
          : diff > 0
            ? t("average.ahead", { count: rounded })
            : t("average.behind", { count: rounded }),
      detail: t("average.detail", {
        from,
        to,
        average: cohort.average.toLocaleString(locale, { maximumFractionDigits: 1 }),
        sampleSize: cohort.sampleSize,
      }),
      cta: null,
      note: null,
    };
  }, [user, birthYear, cohort, visited, locale, t, openAuth, openAccount]);

  // Sin backend no hay con qué comparar, y mientras el perfil o el promedio
  // están en vuelo tampoco: se monta la sección recién cuando tiene algo que
  // decir, en vez de parpadear un estado que no es el real.
  if (!SUPABASE_ENABLED || (user && !profile) || !block) return null;

  return (
    <section className="surface p-5">
      <h2 className="text-xs font-semibold tracking-[0.14em] text-text-faint uppercase">
        {t("heading")}
      </h2>
      <p className="mt-3 text-[15px] leading-snug font-semibold text-accent-ink">
        {block.headline}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-text-dim">{block.detail}</p>

      {block.cta && (
        <button
          type="button"
          onClick={block.cta.onClick}
          className="mt-3 text-[13px] font-medium text-accent-ink underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          {block.cta.label}
        </button>
      )}

      {block.note && (
        <div className="mt-4 border-t border-ink-line pt-3.5">
          <p className="text-[11px] font-semibold tracking-[0.1em] text-text-faint uppercase">
            {block.note.heading}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-text-dim">{block.note.headline}</p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-text-faint">{block.note.caveat}</p>
        </div>
      )}
    </section>
  );
}
