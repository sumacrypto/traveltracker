"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CaretRight, Plus, Question, X } from "@phosphor-icons/react";
import { COUNTRIES, GEOMETRY_ID_BY_CODE } from "@/data/countries";
import { SUBDIVISION_SETS, getSubdivisionSet } from "@/data/subdivisions";
import { useTrip } from "@/lib/store";
import { countryLabel } from "@/lib/countryLabel";
import CountryPicker from "./CountryPicker";

interface SubdivisionEntriesProps {
  onOpen: (countryCode: string, countryName: string) => void;
}

function resolveCountryName(code: string, locale: string) {
  const meta = COUNTRIES[GEOMETRY_ID_BY_CODE[code]];
  return meta ? countryLabel(meta, locale) : code;
}

/**
 * Detalle por estado o provincia. La lista la arma la persona: se agrega el país
 * que quiera de los 214 que tienen divisiones, no solo los que ya marcó.
 */
export default function SubdivisionEntries({ onOpen }: SubdivisionEntriesProps) {
  const locale = useLocale();
  const t = useTranslations("subdivisionEntries");
  const detailCountries = useTrip((state) => state.detailCountries);
  const subdivisions = useTrip((state) => state.subdivisions);
  const addDetailCountry = useTrip((state) => state.addDetailCountry);
  const removeDetailCountry = useTrip((state) => state.removeDetailCountry);

  const [adding, setAdding] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  // El contador sale de las claves del store: no hace falta bajar el archivo del
  // país solo para saber cuántas divisiones marcó.
  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const key of Object.keys(subdivisions)) {
      const code = key.split(":")[0];
      result[code] = (result[code] ?? 0) + 1;
    }
    return result;
  }, [subdivisions]);

  const rows = detailCountries
    .map((code) => ({ code, set: getSubdivisionSet(code) }))
    .filter((row): row is { code: string; set: NonNullable<typeof row.set> } => Boolean(row.set));

  return (
    <section>
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-semibold tracking-[0.14em] text-text-faint uppercase">
          {t("heading")}
        </h2>
        <button
          type="button"
          onClick={() => setHelpOpen((open) => !open)}
          aria-label={t("whatIsThis")}
          aria-expanded={helpOpen}
          className={`grid size-4 place-items-center rounded-full border transition-colors ${
            helpOpen
              ? "border-accent text-accent-ink"
              : "border-ink-line text-text-faint hover:border-accent hover:text-accent-ink"
          }`}
        >
          <Question size={9} weight="bold" />
        </button>
      </div>

      {helpOpen && (
        <p className="mt-2.5 rounded-[10px] border border-ink-line bg-ink p-3 text-[12px] leading-relaxed text-text-dim">
          {t("help")}
        </p>
      )}

      {rows.length === 0 && !adding && (
        <p className="mt-3 text-[13px] leading-relaxed text-text-dim">{t("empty")}</p>
      )}

      {rows.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {rows.map(({ code, set }) => (
            <li key={code} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpen(code, resolveCountryName(code, locale))}
                className="flex flex-1 items-center gap-3 rounded-[10px] border border-ink-line px-3.5 py-3 text-left transition-colors hover:border-accent"
              >
                <span className="flex-1 truncate text-sm">
                  {resolveCountryName(code, locale)}
                </span>
                <span className="font-mono text-xs tabular-nums text-text-dim">
                  <span className={counts[code] ? "text-text" : undefined}>
                    {counts[code] ?? 0}
                  </span>
                  /{set.total}
                </span>
                <CaretRight size={14} weight="bold" className="shrink-0 text-text-faint" />
              </button>

              <button
                type="button"
                onClick={() =>
                  confirmRemove === code ? removeDetailCountry(code) : setConfirmRemove(code)
                }
                onBlur={() => setConfirmRemove(null)}
                aria-label={
                  confirmRemove === code
                    ? t("removeWithData", { country: resolveCountryName(code, locale) })
                    : t("remove", { country: resolveCountryName(code, locale) })
                }
                title={confirmRemove === code ? t("confirmRemove") : t("removeShort")}
                className={`grid size-8 shrink-0 place-items-center rounded-full border transition-colors ${
                  confirmRemove === code
                    ? "border-accent text-accent-ink"
                    : "border-transparent text-text-faint hover:border-ink-line hover:text-text"
                }`}
              >
                <X size={12} weight="bold" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <div className="mt-3">
          <CountryPicker
            value={null}
            onChange={(code) => {
              if (code) addDetailCountry(code);
              setAdding(false);
            }}
            onlyCodes={SUBDIVISION_COUNTRY_SET}
            label={t("addLabel")}
            placeholder={t("addPlaceholder")}
            autoOpen
          />
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="mt-2 text-[12px] text-text-faint transition-colors hover:text-text"
          >
            {t("cancel")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-ink-line px-3.5 py-2.5 text-[13px] font-medium text-text-dim transition-colors hover:border-accent hover:text-accent-ink"
        >
          <Plus size={13} weight="bold" />
          {t("add")}
        </button>
      )}
    </section>
  );
}

/** Los 214 países que tienen divisiones con código ISO. */
const SUBDIVISION_COUNTRY_SET = new Set(Object.keys(SUBDIVISION_SETS));
