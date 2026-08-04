"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react";
import { COUNTRIES, GEOMETRY_ID_BY_CODE } from "@/data/countries";
import { searchCountries } from "@/lib/countrySearch";
import { countryLabel } from "@/lib/countryLabel";

interface CountryPickerProps {
  /** ISO alpha-2 del país elegido */
  value: string | null;
  onChange: (code: string | null) => void;
  placeholder?: string;
  /** Texto de la opción que limpia la selección. Si falta, no se puede limpiar. */
  clearLabel?: string;
  /** Restringe la lista a estos códigos alpha-2. Sin esto se ofrecen los 195. */
  onlyCodes?: Set<string>;
  /** Abre el desplegable al montar, para cuando el picker aparece por una acción. */
  autoOpen?: boolean;
  label: string;
  className?: string;
}

/**
 * Selector de país con buscador. Un `<select>` nativo con 195 opciones obliga a
 * scrollear a ciegas; acá se escribe y se filtra.
 */
export default function CountryPicker({
  value,
  onChange,
  placeholder,
  clearLabel,
  onlyCodes,
  autoOpen = false,
  label,
  className = "",
}: CountryPickerProps) {
  const locale = useLocale();
  const t = useTranslations("countryPicker");
  const resolvedPlaceholder = placeholder ?? t("choosePlaceholder");
  const [open, setOpen] = useState(autoOpen);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const results = useMemo(() => {
    const found = searchCountries(query, locale);
    return onlyCodes ? found.filter((entry) => onlyCodes.has(entry.meta.code)) : found;
  }, [query, onlyCodes, locale]);
  const selected = value ? COUNTRIES[GEOMETRY_ID_BY_CODE[value]] : null;

  // Cerrar al hacer click afuera o con Escape.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Mantener a la vista la opción activa mientras se navega con el teclado.
  useEffect(() => {
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const commit = (code: string | null) => {
    onChange(code);
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const entry = results[activeIndex];
      if (entry) commit(entry.meta.code);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className={`flex w-full items-center gap-2 rounded-full border bg-ink px-3.5 py-2 text-[13px] transition-colors ${
          open ? "border-accent" : "border-ink-line hover:border-accent"
        }`}
      >
        {selected ? (
          <>
            <span aria-hidden>{selected.flag}</span>
            <span className="flex-1 truncate text-left text-text">
              {countryLabel(selected, locale)}
            </span>
          </>
        ) : (
          <span className="flex-1 truncate text-left text-text-faint">{resolvedPlaceholder}</span>
        )}
        <CaretDown size={12} weight="bold" className="shrink-0 text-text-faint" />
      </button>

      {open && (
        <div className="surface absolute top-full right-0 left-0 z-30 mt-2 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-ink-line px-3 py-2.5">
            <MagnifyingGlass size={15} weight="bold" className="shrink-0 text-text-faint" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={t("filterPlaceholder")}
              role="combobox"
              aria-controls={listId}
              aria-expanded
              aria-autocomplete="list"
              aria-activedescendant={
                results[activeIndex] ? `${listId}-${results[activeIndex].key}` : undefined
              }
              className="w-full bg-transparent text-[13px] text-text placeholder:text-text-faint focus:outline-none"
            />
          </div>

          <ul ref={listRef} id={listId} role="listbox" className="max-h-56 overflow-y-auto p-1">
            {clearLabel && !query && (
              <li>
                <button
                  type="button"
                  onClick={() => commit(null)}
                  className="w-full rounded-[10px] px-3 py-2 text-left text-[13px] text-text-dim transition-colors hover:bg-ink-line"
                >
                  {clearLabel}
                </button>
              </li>
            )}

            {results.length === 0 && (
              <li className="px-3 py-4 text-center text-[13px] text-text-faint">
                {t("noMatch")}
              </li>
            )}

            {results.map((entry, index) => (
              <li key={entry.key}>
                <button
                  type="button"
                  id={`${listId}-${entry.key}`}
                  role="option"
                  aria-selected={entry.meta.code === value}
                  onClick={() => commit(entry.meta.code)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-[13px] transition-colors ${
                    index === activeIndex ? "bg-ink-line" : ""
                  }`}
                >
                  <span aria-hidden>{entry.meta.flag}</span>
                  <span className="flex-1 truncate">{countryLabel(entry.meta, locale)}</span>
                  {entry.meta.code === value && (
                    <span className="shrink-0 text-[11px] text-accent-ink">{t("chosen")}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
