"use client";

import { useEffect, useMemo, useState } from "react";
import CountryPicker from "./CountryPicker";
import { COUNTRIES, GEOMETRY_ID_BY_CODE } from "@/data/countries";
import { COUNTRY_TRAVEL_FACTS, PEW_SOURCE, WORLD_TRAVEL_FACT } from "@/data/benchmarks";
import { useTrip } from "@/lib/store";
import { useAccount } from "@/lib/account";
import { SUPABASE_ENABLED, getSupabase } from "@/lib/supabase/client";
import { fetchPeerAverage, type PeerAverage } from "@/lib/peers";
import { describeTail, estimateCountryTail } from "@/lib/stats";

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

  const countryName = country
    ? (COUNTRIES[GEOMETRY_ID_BY_CODE[country]]?.name ?? country)
    : null;

  const peerAverage = loaded?.country === country ? loaded.data : null;

  const line = useMemo(() => {
    if (!country || !countryName) return null;

    // 1. Lo mejor que puede haber: el promedio real de usuarios del mismo país.
    if (peerAverage?.origin === "usuarios") {
      const diff = visited - peerAverage.average;
      const rounded = Math.abs(Math.round(diff));
      return {
        headline:
          diff >= 0
            ? `Le llevás ${rounded} ${rounded === 1 ? "país" : "países"} al promedio de ${countryName}`
            : `Te faltan ${rounded} para el promedio de ${countryName}`,
        detail: `El promedio ahí es ${peerAverage.average.toLocaleString("es-AR", {
          maximumFractionDigits: 1,
        })} países, sobre ${peerAverage.sampleSize} personas registradas.`,
      };
    }

    // 2. Dato publicado del país. Es un solo punto, así que para gente muy
    // arriba del umbral se extrapola la cola en vez de repetir el punto: quien
    // visitó 49 países no está "en el 3%" que llegó a cinco, está mucho más lejos.
    const fact = COUNTRY_TRAVEL_FACTS[country];
    if (fact) {
      const source = `Fuente: ${PEW_SOURCE}.`;
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
            headline: `Estás ${describeTail(tail)} más viajado de ${countryName}`,
            detail: `Estimado: en ${countryName} solo el ${anchor.share}% llegó a ${
              anchor.countries === 10 ? "diez" : "cinco"
            } países, y vos llevás ${visited}. ${source}`,
          };
        }
      }

      if (fact.neverTraveled !== undefined) {
        return {
          headline: `En ${countryName}, ${fact.neverTraveled}% nunca salió del país`,
          detail: visited > 0 ? `Vos ya llevás ${visited}. ${source}` : source,
        };
      }
      if (anchor) {
        const faltan = anchor.countries - visited;
        return {
          headline: `En ${countryName}, solo ${anchor.share}% llegó a ${
            anchor.countries === 10 ? "diez" : "cinco"
          } países`,
          detail:
            visited > 0
              ? `Vos llevás ${visited}. Te ${faltan === 1 ? "falta" : "faltan"} ${faltan} para entrar en ese grupo. ${source}`
              : source,
        };
      }
    }

    // 3. Sin dato del país: se dice que la referencia es mundial, no se finge.
    return {
      headline: `Todavía no tenemos el dato de ${countryName}`,
      detail: `En el mundo, ${WORLD_TRAVEL_FACT.neverTraveled}% nunca salió de su país y solo ${WORLD_TRAVEL_FACT.tenOrMore}% llegó a diez o más. ${
        SUPABASE_ENABLED
          ? "Cuando haya suficiente gente registrada ahí, lo reemplazamos por el promedio real."
          : ""
      }`.trim(),
    };
  }, [country, countryName, peerAverage, visited]);

  return (
    <section className="surface p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="shrink-0 text-[13px] font-medium text-text-dim">¿De dónde sos?</span>
        <CountryPicker
          value={country}
          onChange={handlePick}
          label="Tu país de origen"
          clearLabel="Prefiero no decirlo"
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
              Compará con gente de tu ciudad y tu edad
            </button>
          )}
        </div>
      )}
    </section>
  );
}
