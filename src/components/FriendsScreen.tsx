"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MagnifyingGlass, Trophy, X } from "@phosphor-icons/react";
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
 * (calcado de lo que antes vivía en AccountDialog.tsx) y una comparación 1 a
 * 1 al tocar a alguien de la lista.
 *
 * Nada de esto necesitó una migración nueva: agregar y comparar ya estaban
 * permitidos por las policies existentes (la de "invitar" en connections, y
 * la de perfiles/países visibles para quien está conectado) — mismo criterio
 * que ya usa fetchProfileByReferral, solo que por username en vez de código.
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

  const [compareId, setCompareId] = useState<string | null>(null);
  const [compareCountries, setCompareCountries] = useState<{ friendId: string; codes: string[] } | null>(
    null,
  );

  const load = useCallback(() => {
    if (!user) return;
    Promise.all([fetchLeaderboard(), fetchPendingRequests(user.id), fetchSentRequests(user.id)])
      .then(([rows, inReqs, outReqs]) => {
        setLeaderboard(rows);
        setIncoming(inReqs);
        setOutgoing(outReqs);
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

  const myStats = useMemo(() => computeStats(Object.keys(visited)), [visited]);

  const ranked = rankLeaderboard(
    leaderboard,
    tab,
    (row) => (row.user_id === user?.id ? t("you") : (row.display_name ?? row.username ?? t("noName"))),
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
            {ownIndex >= 0 && (
              <p className="mt-1 text-[13px] text-accent-ink">
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

            {/* Cada fila ajena abre la comparación 1 a 1; la propia no tiene
                sentido tocarla, así que se dibuja aparte, sin botón. */}
            <ol className="mt-3.5 flex flex-col gap-1">
              {ranked.map((row, index) =>
                row.userId === user.id ? (
                  <li key={row.userId} className="flex items-baseline gap-3 px-1 py-1.5">
                    <span className="w-5 font-mono text-xs tabular-nums text-text-faint">
                      {index + 1}
                    </span>
                    <span className="flex-1 truncate text-sm font-semibold">{row.label}</span>
                    <span className="font-mono text-xs tabular-nums text-text-dim">{row.countries}</span>
                  </li>
                ) : (
                  <li key={row.userId}>
                    <button
                      type="button"
                      onClick={() => openCompare(row.userId)}
                      aria-pressed={compareId === row.userId}
                      className={`flex w-full items-baseline gap-3 rounded-xl px-1 py-1.5 text-left transition-colors hover:bg-ink-line/40 ${
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
                  </li>
                ),
              )}
            </ol>
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
