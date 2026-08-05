"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import CountryPicker from "./CountryPicker";
import { COUNTRIES, GEOMETRY_ID_BY_CODE } from "@/data/countries";
import { countryLabel } from "@/lib/countryLabel";
import { factsForOrigin } from "@/lib/countryPairs";
import { useTrip } from "@/lib/store";
import { useAccount } from "@/lib/account";
import { getSupabase } from "@/lib/supabase/client";

/**
 * Carrusel "Sabías que" de curiosidades de viaje bilaterales (país de origen
 * → destino), a partir de countryPairFacts.ts. Vive en /stats, no en el
 * panel del mapa, así que tiene su propio selector de país de origen (mismo
 * patrón que PeerComparison.tsx) en vez de depender de que el usuario ya lo
 * haya elegido ahí.
 *
 * Funciona sin cuenta: el país elegido queda en el mismo store compartido
 * (useTrip.homeCountry) que ya usa PeerComparison, así que si el usuario lo
 * elige en cualquiera de las dos pantallas, la otra ya lo tiene.
 */
export default function CountryFactsCard() {
  const locale = useLocale();
  const t = useTranslations("statsPage.countryFacts");

  const homeCountry = useTrip((state) => state.homeCountry);
  const setHomeCountry = useTrip((state) => state.setHomeCountry);
  const user = useAccount((state) => state.user);
  const profile = useAccount((state) => state.profile);

  const country = profile?.home_country ?? homeCountry;
  const [rawIndex, setIndex] = useState(0);

  const facts = country ? factsForOrigin(country) : [];
  // Cambiar de país puede dejar `rawIndex` apuntando a un hecho que no existe
  // en la lista nueva; el módulo lo acota en vez de resetearlo con un efecto
  // (no hay nada externo que sincronizar acá, es puro dato derivado).
  const index = facts.length ? rawIndex % facts.length : 0;

  const handlePick = (code: string | null) => {
    setHomeCountry(code);
    if (code && user) {
      void getSupabase()?.from("profiles").update({ home_country: code }).eq("id", user.id);
    }
  };

  const countryMeta = country ? COUNTRIES[GEOMETRY_ID_BY_CODE[country]] : null;
  const countryName = countryMeta ? countryLabel(countryMeta, locale) : null;

  const fact = facts[index] ?? null;
  const destinationMeta = fact ? COUNTRIES[GEOMETRY_ID_BY_CODE[fact.destinationCode]] : null;
  const destinationName = destinationMeta ? countryLabel(destinationMeta, locale) : fact?.destinationCode;

  return (
    <section className="surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold tracking-[0.14em] text-text-faint uppercase">
          {t("heading")}
        </h2>
        <CountryPicker
          value={country}
          onChange={handlePick}
          label={t("originPickerLabel")}
          clearLabel={t("originClear")}
          className="w-40"
        />
      </div>

      <div className="mt-3.5 border-t border-ink-line pt-3.5">
        {!country && <p className="text-sm text-text-dim">{t("noCountry")}</p>}

        {country && !fact && (
          <p className="text-sm text-text-dim">{t("noFacts", { country: countryName ?? country })}</p>
        )}

        {fact && (
          <div>
            <p className="text-[15px] leading-snug font-semibold text-accent-ink">
              {t(fact.metric === "outboundShare" ? "outboundShare" : "arrivalsShare", {
                percent: fact.percent,
                origin: countryName ?? fact.originCode,
                destination: destinationName ?? fact.destinationCode,
              })}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-text-dim">
              {t("sourceLine", { source: fact.source, year: fact.year })}
            </p>

            {facts.length > 1 && (
              <div className="mt-3.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i - 1 + facts.length) % facts.length)}
                  aria-label={t("prev")}
                  className="rounded-full border border-ink-line p-1.5 text-text-dim transition-colors hover:border-accent hover:text-accent-ink"
                >
                  <CaretLeft size={13} weight="bold" />
                </button>
                <div className="flex gap-1.5">
                  {facts.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-accent" : "bg-ink-line"}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i + 1) % facts.length)}
                  aria-label={t("next")}
                  className="rounded-full border border-ink-line p-1.5 text-text-dim transition-colors hover:border-accent hover:text-accent-ink"
                >
                  <CaretRight size={13} weight="bold" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
