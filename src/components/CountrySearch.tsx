"use client";

import { useDeferredValue, useId, useMemo, useRef, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { COUNTRIES, type CountryMeta } from "@/data/countries";

const MAX_RESULTS = 6;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

interface Entry {
  key: string;
  meta: CountryMeta;
  haystack: string;
}

const ENTRIES: Entry[] = Object.entries(COUNTRIES)
  .filter(([, meta]) => meta.countable)
  .map(([key, meta]) => ({
    key,
    meta,
    haystack: normalize(`${meta.name} ${meta.nameEn} ${meta.code}`),
  }))
  .sort((a, b) => a.meta.name.localeCompare(b.meta.name, "es"));

interface CountrySearchProps {
  visited: Record<string, true>;
  onPick: (key: string) => void;
}

/**
 * Buscar por nombre es la única forma razonable de marcar países chicos en un
 * teléfono. Además encuadra el mapa en el país elegido.
 */
export default function CountrySearch({ visited, onPick }: CountrySearchProps) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const results = useMemo(() => {
    const q = normalize(deferred);
    if (q.length < 2) return [];
    const starts: Entry[] = [];
    const contains: Entry[] = [];
    for (const entry of ENTRIES) {
      if (entry.haystack.startsWith(q)) starts.push(entry);
      else if (entry.haystack.includes(q)) contains.push(entry);
      if (starts.length >= MAX_RESULTS) break;
    }
    return [...starts, ...contains].slice(0, MAX_RESULTS);
  }, [deferred]);

  const showEmpty = normalize(deferred).length >= 2 && results.length === 0;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-full border border-ink-line bg-ink-raised px-3.5 py-2.5 focus-within:border-accent">
        <MagnifyingGlass size={17} weight="bold" className="shrink-0 text-text-faint" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar un país"
          aria-label="Buscar un país por nombre"
          aria-controls={listId}
          aria-expanded={results.length > 0}
          role="combobox"
          autoComplete="off"
          className="w-full bg-transparent text-sm text-text placeholder:text-text-faint focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Borrar búsqueda"
            className="shrink-0 text-text-faint transition-colors hover:text-text"
          >
            <X size={15} weight="bold" />
          </button>
        )}
      </div>

      {(results.length > 0 || showEmpty) && (
        <ul
          id={listId}
          role="listbox"
          className="surface absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden p-1"
        >
          {showEmpty && (
            <li className="px-3 py-4 text-center text-sm text-text-faint">
              Ningún país coincide con “{deferred.trim()}”.
            </li>
          )}
          {results.map((entry) => {
            const isVisited = Boolean(visited[entry.key]);
            return (
              <li key={entry.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isVisited}
                  onClick={() => {
                    onPick(entry.key);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left transition-colors hover:bg-ink-line"
                >
                  <span aria-hidden>{entry.meta.flag}</span>
                  <span className="flex-1 truncate text-sm">{entry.meta.name}</span>
                  <span
                    className={`text-xs ${isVisited ? "text-accent-ink" : "text-text-faint"}`}
                  >
                    {isVisited ? "quitar" : "marcar"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
