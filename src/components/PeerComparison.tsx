"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import CountryPicker from "./CountryPicker";
import { COUNTRIES, GEOMETRY_ID_BY_CODE } from "@/data/countries";
import { COUNTRY_TRAVEL_FACTS, PEW_SOURCE, WORLD_TRAVEL_FACT } from "@/data/benchmarks";
import { useTrip } from "@/lib/store";
import { useAccount } from "@/lib/account";
import { SUPABASE_ENABLED, getSupabase } from "@/lib/supabase/client";
import { fetchPeerAverage, type PeerAverage } from "@/lib/peers";
import { describeTail, estimateCountryTail, type TailDescriptor } from "@/lib/stats";
import { countryLabel } from "@/lib/countryLabel";

interface PeerComparisonProps {
  visited: number;
  onSignIn: () => void;
}

/**
 * Comparación contra la gente del país de origen. Funciona sin cuenta: el país
 * se elige acá mismo y queda en localStorage. Con cuenta, además se guarda en el
 * perfil y habilita el promedio real de usuarios.
 */
export default function PeerComparison({ visited, onSignIn }: PeerComparisonProps) {
  const locale = useLocale();
  const t = useTranslations("peerComparison");
  const homeCountry = useTrip((state) => state.homeCountry);
  const setHomeCountry = useTrip((state) => state.setHomeCountry);
  const user = useAccount((state) => state.user);
  const profile = useAccount((state) => state.profile);

  // El perfil manda si ya tiene país cargado; si no, vale lo elegido localmente.
  const country = profile?.home_country ?? homeCountry;

  const [loaded, setLoaded] = useState<{ country: string; data: PeerAverage | null } | null>(null);

  useEffect(() => {
    if (!country || !SUPABASE_ENABLED) return;
    let active = true;
    fetchPeerAverage(country)
      .then((data) => {
        if (active) setLoaded({ country, data });
      })
      .catch(() => {
        if (active) setLoaded({ country, data: null });
      });
    return () => {
      active = false;
    };
  }, [country]);

  const handlePick = (code: string | null) => {
    setHomeCountry(code);
    // Con sesión abierta el país también va al perfil, que es lo que alimenta
    // los promedios agregados.
    if (code && user) {
      void getSupabase()?.from("profiles").update({ home_country: code }).eq("id", user.id);
    }
  };

  const countryMeta = country ? COUNTRIES[GEOMETRY_ID_BY_CODE[country]] : null;
  const countryName = countryMeta ? countryLabel(countryMeta, locale) : (country ?? null);

  const peerAverage = loaded?.country === country ? loaded.data : null;
  const source = t("source", { source: PEW_SOURCE });

  const line = useMemo(() => {
    if (!country || !countryName) return null;

    // "en el 3%" / "in the top 3%" es una frase entera armada por idioma, no
    // un fragmento pegado a mano: cada idioma la interpola completa dentro de
    // la oración más grande ("Estás {tail} más viajado de X").
    const tailPhrase = (tail: TailDescriptor) =>
      tail.tier === "underTenth" ? t("tail.underTenth") : t("tail.top", { value: tail.value ?? 0 });

    // 1. Lo mejor que puede haber: el promedio real de usuarios del mismo país.
    if (peerAverage?.origin === "usuarios") {
      const diff = visited - peerAverage.average;
      const rounded = Math.abs(Math.round(diff));
      return {
        headline:
          diff >= 0
            ? t("usersAverage.ahead", { count: rounded, country: countryName })
            : t("usersAverage.behind", { count: rounded, country: countryName }),
        detail: t("usersAverage.detail", {
          average: peerAverage.average.toLocaleString(locale, { maximumFractionDigits: 1 }),
          sampleSize: peerAverage.sampleSize,
        }),
      };
    }

    // 2. Dato publicado del país. Es un solo punto, así que para gente muy
    // arriba del umbral se extrapola la cola en vez de repetir el punto: quien
    // visitó 49 países no está "en el 3%" que llegó a cinco, está mucho más lejos.
    const fact = COUNTRY_TRAVEL_FACTS[country];
    if (fact) {
      const anchor =
        fact.tenOrMore !== undefined
          ? { countries: 10, share: fact.tenOrMore }
          : fact.fiveOrMore !== undefined
            ? { countries: 5, share: fact.fiveOrMore }
            : null;

      if (anchor && visited >= anchor.countries) {
        const tail = estimateCountryTail(visited, anchor);
        if (tail !== null) {
          return {
            headline: t("countryTail.headline", {
              tail: tailPhrase(describeTail(tail)),
              country: countryName,
            }),
            detail: t("countryTail.detail", {
              country: countryName,
              share: anchor.share,
              threshold: anchor.countries,
              count: visited,
              source,
            }),
          };
        }
      }

      if (fact.neverTraveled !== undefined) {
        return {
          headline: t("neverTraveled.headline", { country: countryName, share: fact.neverTraveled }),
          detail:
            visited > 0
              ? t("neverTraveled.detailWithCount", { count: visited, source })
              : t("neverTraveled.detailWithoutCount", { source }),
        };
      }
      if (anchor) {
        const remaining = anchor.countries - visited;
        return {
          headline: t("thresholdOnly.headline", {
            country: countryName,
            share: anchor.share,
            threshold: anchor.countries,
          }),
          detail:
            visited > 0
              ? t("thresholdOnly.detailWithCount", { count: visited, remaining, source })
              : t("thresholdOnly.detailWithoutCount", { source }),
        };
      }
    }

    // 3. Sin dato del país: se dice que la referencia es mundial, no se finge.
    return {
      headline: t("noData.headline", { country: countryName }),
      detail: t("noData.detail", {
        neverTraveled: WORLD_TRAVEL_FACT.neverTraveled ?? 0,
        tenOrMore: WORLD_TRAVEL_FACT.tenOrMore ?? 0,
        supabaseNote: SUPABASE_ENABLED ? t("noData.supabaseNote") : "",
      }).trim(),
    };
  }, [country, countryName, peerAverage, visited, locale, source, t]);

  return (
    <section className="surface p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="shrink-0 text-[13px] font-medium text-text-dim">{t("originLabel")}</span>
        <CountryPicker
          value={country}
          onChange={handlePick}
          label={t("originPickerLabel")}
          clearLabel={t("originClear")}
          className="w-44"
        />
      </div>

      {line && (
        <div className="mt-3.5 border-t border-ink-line pt-3.5">
          <p className="text-[15px] leading-snug font-semibold text-accent-ink">{line.headline}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-text-dim">{line.detail}</p>

          {SUPABASE_ENABLED && !user && (
            <button
              type="button"
              onClick={onSignIn}
              className="mt-3 text-[13px] font-medium text-accent-ink underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              {t("compareCta")}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
