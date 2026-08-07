"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MagnifyingGlass, Plus, Tag, Trophy, X } from "@phosphor-icons/react";
import { useAccount } from "@/lib/account";
import { useUiDialogs } from "@/lib/uiState";
import { useTrip } from "@/lib/store";
import { SUPABASE_ENABLED } from "@/lib/supabase/client";
import {
  acceptRequest,
  fetchFriendCountries,
  fetchLeaderboard,
  fetchPendingRequests,
  fetchSentRequests,
  findProfileByUsername,
  rankLeaderboard,
  sendFriendRequest,
  LEADERBOARD_TABS,
  type PendingRequest,
  type SentRequest,
} from "@/lib/peers";
import { addFriendLabel, fetchFriendLabels, removeFriendLabel, type FriendLabel } from "@/lib/friendLabels";
import { computeStats, describeTail, rankPercentile, type TailDescriptor } from "@/lib/stats";
import { codesToGeometryIds } from "@/lib/countryCodes";
import { track } from "@/lib/analytics";
import type { Continent } from "@/data/countries";
import type { LeaderboardRow, Profile } from "@/lib/supabase/types";

type SearchState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "notFound" }
  | { kind: "self" }
  | { kind: "found"; profile: Profile; already: "none" | "friends" | "pending" }
  | { kind: "sent" }
  | { kind: "connected" }
  | { kind: "error" };

/**
 * Pantalla de /friends: agregar gente por nombre de usuario (no solo por
 * link), ver solicitudes en las dos direcciones, el ranking de siempre
 * (calcado de lo que antes vivía en AccountDialog.tsx), etiquetas propias
 * para organizar y filtrar esa lista, y una comparación 1 a 1 al tocar a
 * alguien de la lista.
 *
 * Nada de esto necesitó las migraciones grandes que sí hicieron falta antes:
 * agregar y comparar ya estaban permitidos por las policies existentes (la de
 * "invitar" en connections, y la de perfiles/países visibles para quien está
 * conectado) — mismo criterio que ya usa fetchProfileByReferral, solo que por
 * username en vez de código. Las etiquetas sí son una tabla nueva
 * (friend_labels), pero mínima: sin invite link ni membresía que aceptar,
 * reemplazan a los grupos de la fase 4 por eso mismo — ver
 * 0010_friend_labels.sql.
 */
export default function FriendsScreen() {
  const t = useTranslations("friendsPage");
  const tc = useTranslations("common.continents");
  const locale = useLocale();
  const user = useAccount((state) => state.user);
  const openAuth = useUiDialogs((state) => state.openAuth);
  const visited = useTrip((state) => state.visited);

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState>({ kind: "idle" });

  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [incoming, setIncoming] = useState<PendingRequest[]>([]);
  const [outgoing, setOutgoing] = useState<SentRequest[]>([]);
  const [tab, setTab] = useState<Continent | "general">("general");
  const [loadError, setLoadError] = useState<string | null>(null);

  // Etiquetas: organización de la propia lista, no reemplazan a "amigos" — un
  // amigo puede tener cero, una o varias. activeLabel filtra qué filas se
  // muestran; taggingId/labelDraft son del panel que se abre por fila para
  // asignarlas (ver el botón de tag en cada fila, más abajo).
  const [labels, setLabels] = useState<FriendLabel[]>([]);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [taggingId, setTaggingId] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState("");

  const [compareId, setCompareId] = useState<string | null>(null);
  const [compareCountries, setCompareCountries] = useState<{ friendId: string; codes: string[] } | null>(
    null,
  );

  const load = useCallback(() => {
    if (!user) return;
    Promise.all([
      fetchLeaderboard(),
      fetchPendingRequests(user.id),
      fetchSentRequests(user.id),
      fetchFriendLabels(user.id),
    ])
      .then(([rows, inReqs, outReqs, labelRows]) => {
        setLeaderboard(rows);
        setIncoming(inReqs);
        setOutgoing(outReqs);
        setLabels(labelRows);
      })
      .catch(() => setLoadError(t("loadFailed")));
  }, [user, t]);

  useEffect(load, [load]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = query.trim();
    if (!name || !user) return;

    setSearch({ kind: "loading" });
    try {
      const profile = await findProfileByUsername(name);
      if (!profile) {
        setSearch({ kind: "notFound" });
        return;
      }
      if (profile.id === user.id) {
        setSearch({ kind: "self" });
        return;
      }
      const already = leaderboard.some((row) => row.user_id === profile.id)
        ? "friends"
        : outgoing.some((row) => row.friendId === profile.id)
          ? "pending"
          : "none";
      setSearch({ kind: "found", profile, already });
    } catch {
      setSearch({ kind: "error" });
    }
  };

  const handleAdd = async (targetId: string) => {
    try {
      const result = await sendFriendRequest(targetId);
      track("friend_connected", { via: "username" });
      setSearch({ kind: result === "connected" ? "connected" : "sent" });
      load();
    } catch {
      setSearch({ kind: "error" });
    }
  };

  const handleAccept = async (request: PendingRequest) => {
    try {
      await acceptRequest(request.id);
      track("friend_connected", { via: "request" });
      load();
    } catch {
      setLoadError(t("acceptFailed"));
    }
  };

  const openCompare = (friendId: string) => {
    setCompareId(friendId);
    if (compareCountries?.friendId === friendId) return;
    fetchFriendCountries(friendId)
      .then((codes) => setCompareCountries({ friendId, codes }))
      .catch(() => setCompareCountries({ friendId, codes: [] }));
  };

  /**
   * Togglea una etiqueta sobre un amigo: si ya la tenía, la saca; si no, la
   * pone (y de paso la crea, si el nombre es nuevo — no hay un paso separado
   * de "crear etiqueta"). Se usa tanto al tocar un chip existente como al
   * mandar el formulario de "etiqueta nueva" del panel por fila.
   */
  const toggleLabel = async (friendId: string, label: string) => {
    if (!user) return;
    const existing = labels.find((l) => l.friendId === friendId && l.label === label);
    try {
      if (existing) {
        await removeFriendLabel(existing.id);
        setLabels((prev) => prev.filter((l) => l.id !== existing.id));
      } else {
        // addFriendLabel devuelve la fila creada (con su id real): se suma
        // directo al estado, sin pedir la lista entera de nuevo.
        const created = await addFriendLabel(user.id, friendId, label);
        if (created) setLabels((prev) => [...prev, created]);
      }
    } catch {
      setLoadError(t("labels.error"));
    }
  };

  const myStats = useMemo(() => computeStats(Object.keys(visited)), [visited]);

  // Etiquetas que existen de verdad: el `distinct label` de las propias filas
  // (ver 0010_friend_labels.sql) — una etiqueta sin nadie adentro no aparece,
  // desaparece sola en vez de quedar como un filtro vacío suelto.
  const distinctLabels = useMemo(
    () => [...new Set(labels.map((l) => l.label))].sort((a, b) => a.localeCompare(b, locale)),
    [labels, locale],
  );

  // El filtro por etiqueta decide qué filas entran; el propio usuario queda
  // siempre visible sea cual sea el filtro, para que el percentil de abajo
  // siga teniendo sentido ("en qué lugar quedo yo dentro de este grupo").
  const visibleLeaderboard = activeLabel
    ? leaderboard.filter(
        (row) =>
          row.user_id === user?.id ||
          labels.some((l) => l.friendId === row.user_id && l.label === activeLabel),
      )
    : leaderboard;

  const ranked = rankLeaderboard(
    visibleLeaderboard,
    tab,
    (row) => {
      const name = row.display_name ?? row.username ?? t("noName");
      // El nombre propio ayuda a ubicarse en la lista de un vistazo — "You" a
      // secas obligaba a contar filas para saber cuál era la propia.
      return row.user_id === user?.id ? t("youLabel", { name }) : name;
    },
    locale,
  );
  const ownIndex = ranked.findIndex((row) => row.userId === user?.id);

  // "en el X%" es una frase entera armada por idioma (ver PeerComparison.tsx),
  // no un fragmento pegado a mano.
  const tailPhrase = (tail: TailDescriptor) =>
    tail.tier === "underTenth" ? t("tail.underTenth") : t("tail.top", { value: tail.value ?? 0 });

  const compareFriend = compareId ? leaderboard.find((row) => row.user_id === compareId) : null;
  const compareStats =
    compareFriend && compareCountries?.friendId === compareId
      ? computeStats(codesToGeometryIds(compareCountries.codes))
      : null;
  const compareName = compareFriend
    ? (compareFriend.display_name ?? compareFriend.username ?? t("noName"))
    : "";

  if (!SUPABASE_ENABLED) return null;

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-5 lg:p-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("heading")}</h1>
          <p className="mt-1 text-sm text-text-dim">{t("subheading")}</p>
        </div>
        <section className="surface p-5">
          <p className="text-[15px] leading-snug font-semibold">{t("signedOut.headline")}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-text-dim">{t("signedOut.detail")}</p>
          <button
            type="button"
            onClick={openAuth}
            className="mt-3 text-[13px] font-medium text-accent-ink underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            {t("signedOut.cta")}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 overflow-y-auto p-5 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("heading")}</h1>
        <p className="mt-1 text-sm text-text-dim">{t("subheading")}</p>
      </div>

      {/* --- Agregar por usuario ------------------------------------------ */}
      <section className="surface p-5">
        <h2 className="text-xs font-semibold tracking-[0.14em] text-text-faint uppercase">
          {t("add.heading")}
        </h2>
        <form onSubmit={handleSearch} className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearch({ kind: "idle" });
            }}
            placeholder={t("add.placeholder")}
            className="w-full rounded-full border border-ink-line bg-ink px-4 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={search.kind === "loading" || !query.trim()}
            aria-label={t("add.submit")}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-ink-line text-text-dim transition-colors hover:border-accent hover:text-accent-ink disabled:pointer-events-none disabled:opacity-40"
          >
            <MagnifyingGlass size={16} weight="bold" />
          </button>
        </form>

        {search.kind === "notFound" && (
          <p className="mt-3 text-[13px] text-text-dim">{t("add.notFound")}</p>
        )}
        {search.kind === "self" && <p className="mt-3 text-[13px] text-text-dim">{t("add.self")}</p>}
        {search.kind === "error" && <p className="mt-3 text-[13px] text-accent-ink">{t("add.error")}</p>}
        {search.kind === "sent" && (
          <p className="mt-3 text-[13px] text-accent-ink">{t("add.requestSent")}</p>
        )}
        {search.kind === "connected" && (
          <p className="mt-3 text-[13px] text-accent-ink">{t("add.connected")}</p>
        )}

        {search.kind === "found" && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-ink-line p-3">
            <span className="flex-1 truncate text-sm font-medium">
              {search.profile.display_name ?? search.profile.username}
            </span>
            {search.already === "friends" ? (
              <span className="shrink-0 text-[12px] text-text-faint">{t("add.alreadyFriends")}</span>
            ) : search.already === "pending" ? (
              <span className="shrink-0 text-[12px] text-text-faint">{t("add.alreadyRequested")}</span>
            ) : (
              <button
                type="button"
                onClick={() => handleAdd(search.profile.id)}
                className="shrink-0 rounded-full bg-accent px-3.5 py-1.5 text-[12px] font-semibold text-white transition-opacity active:scale-[0.98]"
              >
                {t("add.sendRequest")}
              </button>
            )}
          </div>
        )}
      </section>

      {/* --- Solicitudes entrantes ----------------------------------------- */}
      {incoming.length > 0 && (
        <section className="surface p-5">
          <h2 className="text-xs font-semibold tracking-[0.14em] text-text-faint uppercase">
            {t("requestsHeading")}
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {incoming.map((request) => (
              <li key={request.id} className="flex items-center gap-3">
                <span className="flex-1 truncate text-sm">
                  {request.display_name ?? request.username ?? t("someone")}
                </span>
                <button
                  type="button"
                  onClick={() => handleAccept(request)}
                  className="shrink-0 rounded-full border border-ink-line px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent hover:text-accent-ink"
                >
                  {t("accept")}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* --- Solicitudes salientes ------------------------------------------ */}
      {outgoing.length > 0 && (
        <section className="surface p-5">
          <h2 className="text-xs font-semibold tracking-[0.14em] text-text-faint uppercase">
            {t("sentHeading")}
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {outgoing.map((request) => (
              <li key={request.id} className="flex items-center gap-3">
                <span className="flex-1 truncate text-sm text-text-dim">
                  {request.display_name ?? request.username ?? t("someone")}
                </span>
                <span className="shrink-0 text-[12px] text-text-faint">{t("sentPending")}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* --- Ranking --------------------------------------------------------
          Calcado de lo que antes vivía en AccountDialog.tsx: el ranking se
          recalcula en el cliente a partir de country_codes, así "por
          continente" no depende de que el servidor conozca los continentes. */}
      <section className="surface p-5">
        <h2 className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-text-faint uppercase">
          <Trophy size={14} weight="fill" className="text-accent" />
          {t("listHeading")}
        </h2>

        {leaderboard.length <= 1 ? (
          <>
            <p className="mt-3 text-[15px] leading-snug font-semibold">{t("emptyHeadline")}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-text-dim">{t("emptyDetail")}</p>
          </>
        ) : (
          <>
            {/* Filtro por etiqueta: decide qué filas entran. Sin etiquetas
                creadas todavía no hay nada que mostrar acá — aparece solo
                cuando ya se etiquetó a alguien, ver el panel por fila más
                abajo. */}
            {distinctLabels.length > 0 && (
              <div
                role="tablist"
                aria-label={t("labels.filterAriaLabel")}
                className="mt-3 flex gap-1 overflow-x-auto pb-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeLabel === null}
                  onClick={() => setActiveLabel(null)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors ${
                    activeLabel === null
                      ? "bg-accent text-white"
                      : "border border-ink-line text-text-dim hover:border-accent"
                  }`}
                >
                  {t("labels.all")}
                </button>
                {distinctLabels.map((label) => (
                  <button
                    key={label}
                    type="button"
                    role="tab"
                    aria-selected={activeLabel === label}
                    onClick={() => setActiveLabel(label)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors ${
                      activeLabel === label
                        ? "bg-accent text-white"
                        : "border border-ink-line text-text-dim hover:border-accent"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {ownIndex >= 0 && (
              <p className="mt-3 text-[13px] text-accent-ink">
                {t("percentile", {
                  tail: tailPhrase(describeTail(rankPercentile(ownIndex + 1, ranked.length))),
                })}
              </p>
            )}

            <div
              role="tablist"
              aria-label={t("listHeading")}
              className="mt-3 flex gap-1 overflow-x-auto pb-1"
            >
              {LEADERBOARD_TABS.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={tab === option}
                  onClick={() => setTab(option)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors ${
                    tab === option
                      ? "bg-accent text-white"
                      : "border border-ink-line text-text-dim hover:border-accent"
                  }`}
                >
                  {option === "general" ? t("general") : tc(option)}
                </button>
              ))}
            </div>

            {activeLabel && ranked.length <= 1 ? (
              <p className="mt-3.5 text-[13px] leading-relaxed text-text-dim">
                {t("labels.emptyFilter", { label: activeLabel })}
              </p>
            ) : (
              /* Cada fila ajena abre la comparación 1 a 1 al tocarla; el botón
                 de tag es un elemento hermano, no anidado, para no meter un
                 <button> adentro de otro. La propia fila no tiene sentido
                 tocarla para comparar (ni etiquetarse a uno mismo), así que
                 se dibuja aparte, sin ninguno de los dos botones. */
              <ol className="mt-3.5 flex flex-col gap-1">
                {ranked.map((row, index) =>
                  row.userId === user.id ? (
                    <li key={row.userId} className="flex items-baseline gap-3 px-1 py-1.5">
                      <span className="w-5 font-mono text-xs tabular-nums text-text-faint">
                        {index + 1}
                      </span>
                      <span className="flex-1 truncate text-sm font-semibold">{row.label}</span>
                      <span className="font-mono text-xs tabular-nums text-text-dim">
                        {row.countries}
                      </span>
                    </li>
                  ) : (
                    <Fragment key={row.userId}>
                      <li className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openCompare(row.userId)}
                          aria-pressed={compareId === row.userId}
                          className={`flex flex-1 items-baseline gap-3 rounded-xl px-1 py-1.5 text-left transition-colors hover:bg-ink-line/40 ${
                            compareId === row.userId ? "bg-ink-line/40" : ""
                          }`}
                        >
                          <span className="w-5 font-mono text-xs tabular-nums text-text-faint">
                            {index + 1}
                          </span>
                          <span className="flex-1 truncate text-sm">{row.label}</span>
                          <span className="font-mono text-xs tabular-nums text-text-dim">
                            {row.countries}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTaggingId(taggingId === row.userId ? null : row.userId);
                            setLabelDraft("");
                          }}
                          aria-label={t("labels.manage")}
                          aria-expanded={taggingId === row.userId}
                          className={`shrink-0 rounded-full p-1.5 transition-colors ${
                            taggingId === row.userId
                              ? "text-accent-ink"
                              : "text-text-faint hover:text-accent-ink"
                          }`}
                        >
                          <Tag size={14} weight={taggingId === row.userId ? "fill" : "regular"} />
                        </button>
                      </li>

                      {taggingId === row.userId && (
                        <li className="-mt-1 mb-1 rounded-xl bg-ink-line/30 px-3 py-2.5">
                          {distinctLabels.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {distinctLabels.map((label) => {
                                const applied = labels.some(
                                  (l) => l.friendId === row.userId && l.label === label,
                                );
                                return (
                                  <button
                                    key={label}
                                    type="button"
                                    onClick={() => toggleLabel(row.userId, label)}
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                      applied
                                        ? "bg-accent text-white"
                                        : "border border-ink-line text-text-dim hover:border-accent"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          <form
                            onSubmit={(event) => {
                              event.preventDefault();
                              const name = labelDraft.trim();
                              if (!name) return;
                              toggleLabel(row.userId, name);
                              setLabelDraft("");
                            }}
                            className={`flex items-center gap-1.5 ${distinctLabels.length > 0 ? "mt-2" : ""}`}
                          >
                            <input
                              type="text"
                              value={labelDraft}
                              onChange={(event) => setLabelDraft(event.target.value)}
                              placeholder={t("labels.newPlaceholder")}
                              maxLength={40}
                              className="w-full rounded-full border border-ink-line bg-ink px-3 py-1.5 text-[12px] text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
                            />
                            <button
                              type="submit"
                              disabled={!labelDraft.trim()}
                              aria-label={t("labels.add")}
                              className="grid size-7 shrink-0 place-items-center rounded-full border border-ink-line text-text-dim transition-colors hover:border-accent hover:text-accent-ink disabled:pointer-events-none disabled:opacity-40"
                            >
                              <Plus size={12} weight="bold" />
                            </button>
                          </form>
                        </li>
                      )}
                    </Fragment>
                  ),
                )}
              </ol>
            )}
          </>
        )}
      </section>

      {/* --- Comparación 1 a 1 ---------------------------------------------- */}
      {compareFriend && (
        <section className="surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xs font-semibold tracking-[0.14em] text-text-faint uppercase">
              {t("compare.heading", { name: compareName })}
            </h2>
            <button
              type="button"
              onClick={() => setCompareId(null)}
              aria-label={t("compare.close")}
              className="text-text-faint transition-colors hover:text-text-dim"
            >
              <X size={14} weight="bold" />
            </button>
          </div>

          {!compareStats ? (
            <div className="skeleton mt-3 h-12 w-full rounded-xl" />
          ) : (
            <>
              <p className="mt-3 text-[15px] leading-snug font-semibold text-accent-ink">
                {(() => {
                  const diff = myStats.visited - compareStats.visited;
                  const rounded = Math.abs(Math.round(diff));
                  if (rounded === 0) return t("compare.tie", { name: compareName });
                  return diff > 0
                    ? t("compare.ahead", { name: compareName, count: rounded })
                    : t("compare.behind", { name: compareName, count: rounded });
                })()}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-text-dim">
                {t("compare.detail", { name: compareName, count: compareStats.visited })}
              </p>
            </>
          )}
        </section>
      )}

      {loadError && <p className="text-[13px] leading-relaxed text-accent-ink">{loadError}</p>}
    </div>
  );
}
