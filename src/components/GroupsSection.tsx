"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Copy, Plus, UsersThree } from "@phosphor-icons/react";
import { getPathname } from "@/i18n/navigation";
import { useAccount, rememberGroupInvite } from "@/lib/account";
import { useUiDialogs } from "@/lib/uiState";
import { SUPABASE_ENABLED } from "@/lib/supabase/client";
import {
  createGroup,
  deleteGroup,
  fetchGroupLeaderboard,
  fetchMyGroups,
  leaveGroup,
  redeemGroupInvite,
} from "@/lib/groups";
import { rankLeaderboard } from "@/lib/peers";
import { describeTail, rankPercentile, type TailDescriptor } from "@/lib/stats";
import { track } from "@/lib/analytics";
import type { GroupLeaderboardRow, MyGroup } from "@/lib/supabase/types";

/** Lee `?g=` una sola vez, antes del primer render (mismo criterio que ReferralWelcome). */
function readInviteCode(): string | null {
  if (typeof window === "undefined" || !SUPABASE_ENABLED) return null;
  return new URLSearchParams(window.location.search).get("g");
}

/**
 * Cohorts personalizados: los grupos que la persona arma ella misma y a los que
 * suma gente por link, sin que haga falta estar conectados 1 a 1 antes.
 *
 * El link (`?g=...`) nunca se canjea en silencio: se muestra la invitación y se
 * espera un click. Es la misma lección que dejó ReferralWelcome — canjear de
 * callado deja a la persona sin enterarse de que la invitaron.
 */
export default function GroupsSection() {
  const t = useTranslations("statsPage.groups");
  const locale = useLocale();
  const user = useAccount((state) => state.user);
  const status = useAccount((state) => state.status);
  const openAuth = useUiDialogs((state) => state.openAuth);

  const [loadedGroups, setLoadedGroups] = useState<MyGroup[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // El ranking viaja junto al grupo al que pertenece: así, mientras se pide el
  // del grupo recién elegido, no se muestra por un frame el del anterior.
  const [board, setBoard] = useState<{ groupId: string; rows: GroupLeaderboardRow[] } | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // Salir o borrar no se puede deshacer, así que se confirma en dos toques en
  // vez de abrir un modal (mismo patrón que el reset de StatsRail).
  const [confirmingExit, setConfirmingExit] = useState(false);

  const [inviteCode, setInviteCode] = useState<string | null>(readInviteCode);
  const [joinedName, setJoinedName] = useState<string | null>(null);
  const [inviteFailed, setInviteFailed] = useState(false);

  // Sin sesión no hay grupos que mostrar. Se deriva en vez de limpiarse desde un
  // efecto: al cerrar sesión, el estado viejo deja de usarse solo.
  const groups = user ? loadedGroups : [];
  const current = groups.find((group) => group.id === selectedId) ?? groups[0] ?? null;
  const currentId = current?.id ?? null;
  const rows = board?.groupId === currentId ? board.rows : [];

  const loadGroups = useCallback(async () => {
    const mine = await fetchMyGroups();
    setLoadedGroups(mine);
    return mine;
  }, []);

  useEffect(() => {
    if (!user || !SUPABASE_ENABLED) return;
    // Mientras la cuenta sincroniza no se pide nada: es justo el momento en que
    // AccountSync canjea un `?g=` que quedó pendiente de antes de iniciar
    // sesión, y pedir la lista en el medio la traería sin ese grupo. Cuando el
    // estado pasa a "synced" este efecto vuelve a correr y ahí sí está todo.
    if (status === "loading") return;

    let active = true;
    fetchMyGroups()
      .then((mine) => {
        if (active) setLoadedGroups(mine);
      })
      .catch(() => {
        if (active) setError(t("errors.loadFailed"));
      });
    return () => {
      active = false;
    };
  }, [user, status, t]);

  useEffect(() => {
    if (!currentId) return;
    let active = true;
    fetchGroupLeaderboard(currentId)
      .then((data) => {
        if (active) setBoard({ groupId: currentId, rows: data });
      })
      .catch(() => {
        if (active) setBoard({ groupId: currentId, rows: [] });
      });
    return () => {
      active = false;
    };
  }, [currentId]);

  useEffect(() => {
    if (!confirmingExit) return;
    const timer = setTimeout(() => setConfirmingExit(false), 4000);
    return () => clearTimeout(timer);
  }, [confirmingExit]);

  /** Saca el `?g=` de la URL para que un refresh no vuelva a ofrecer lo mismo. */
  const clearCodeFromUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("g");
    window.history.replaceState({}, "", url.toString());
  };

  const handleJoin = async () => {
    if (!inviteCode) return;

    if (!user) {
      // Sin sesión el canje lo termina AccountSync apenas haya usuario.
      rememberGroupInvite(inviteCode);
      clearCodeFromUrl();
      setInviteCode(null);
      openAuth();
      return;
    }

    setBusy(true);
    try {
      const groupId = await redeemGroupInvite(inviteCode);
      clearCodeFromUrl();
      setInviteCode(null);

      if (!groupId) {
        setInviteFailed(true);
        return;
      }

      const mine = await loadGroups();
      setSelectedId(groupId);
      setJoinedName(mine.find((group) => group.id === groupId)?.name ?? null);
      track("group_joined", {});
    } catch {
      setInviteFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || busy) return;

    setBusy(true);
    setError(null);
    try {
      const groupId = await createGroup(trimmed);
      setName("");
      await loadGroups();
      if (groupId) setSelectedId(groupId);
      track("group_created", {});
    } catch {
      setError(t("errors.createFailed"));
    } finally {
      setBusy(false);
    }
  };

  const handleExit = async () => {
    if (!current || !user) return;
    if (!confirmingExit) {
      setConfirmingExit(true);
      return;
    }

    setConfirmingExit(false);
    setBusy(true);
    try {
      // El dueño borra el grupo entero; el resto solo se saca a sí mismo.
      if (current.is_owner) await deleteGroup(current.id);
      else await leaveGroup(current.id, user.id);
      setSelectedId(null);
      await loadGroups();
    } catch {
      setError(t("errors.leaveFailed"));
    } finally {
      setBusy(false);
    }
  };

  // El link lleva el locale de quien invita (getPathname resuelve el prefijo
  // según `localePrefix: "as-needed"`) y apunta a /stats, que es donde vive esta
  // sección: quien lo abre cae directo en la invitación.
  const inviteLink =
    current && typeof window !== "undefined"
      ? window.location.origin +
        getPathname({ href: { pathname: "/stats", query: { g: current.invite_code } }, locale })
      : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setError(t("errors.copyFailed"));
    }
  };

  const ranked = rankLeaderboard(
    rows,
    "general",
    (row) =>
      row.user_id === user?.id ? t("you") : (row.display_name ?? row.username ?? t("noName")),
    locale,
  );
  const ownIndex = ranked.findIndex((row) => row.userId === user?.id);

  // "en el X%" es una frase entera armada por idioma (ver PeerComparison.tsx),
  // no un fragmento pegado a mano.
  const tailPhrase = (tail: TailDescriptor) =>
    tail.tier === "underTenth" ? t("tail.underTenth") : t("tail.top", { value: tail.value ?? 0 });

  if (!SUPABASE_ENABLED) return null;

  return (
    <section className="surface p-5">
      <h2 className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-text-faint uppercase">
        <UsersThree size={14} weight="fill" className="text-accent" />
        {t("heading")}
      </h2>

      {/* --- Invitación entrante --------------------------------------------- */}
      {inviteCode && (
        <div className="mt-3 rounded-2xl border border-accent/40 bg-accent/5 p-4">
          <p className="text-[15px] leading-snug font-semibold text-accent-ink">
            {t("invite.headline")}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-text-dim">{t("invite.detail")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleJoin}
              disabled={busy}
              className="rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-opacity active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {user ? t("invite.join") : t("invite.signInAndJoin")}
            </button>
            <button
              type="button"
              onClick={() => {
                clearCodeFromUrl();
                setInviteCode(null);
              }}
              className="rounded-full border border-ink-line px-4 py-2 text-[13px] font-medium text-text-dim transition-colors hover:border-accent hover:text-accent-ink"
            >
              {t("invite.dismiss")}
            </button>
          </div>
        </div>
      )}

      {inviteFailed && (
        <p className="mt-3 text-[13px] leading-relaxed text-accent-ink">{t("invite.failed")}</p>
      )}
      {joinedName && (
        <p className="mt-3 text-[13px] leading-relaxed text-accent-ink">
          {t("joined", { name: joinedName })}
        </p>
      )}

      {!user ? (
        /* --- Sin cuenta ---------------------------------------------------- */
        <>
          <p className="mt-3 text-[13px] leading-relaxed text-text-dim">{t("intro")}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-text-dim">{t("signedOut.detail")}</p>
          <button
            type="button"
            onClick={openAuth}
            className="mt-3 text-[13px] font-medium text-accent-ink underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            {t("signedOut.cta")}
          </button>
        </>
      ) : (
        <>
          {groups.length === 0 ? (
            <>
              <p className="mt-3 text-[15px] leading-snug font-semibold">{t("empty.headline")}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-text-dim">{t("empty.detail")}</p>
            </>
          ) : (
            <div
              role="tablist"
              aria-label={t("heading")}
              className="mt-3 flex gap-1 overflow-x-auto pb-1"
            >
              {groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  role="tab"
                  aria-selected={currentId === group.id}
                  onClick={() => setSelectedId(group.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors ${
                    currentId === group.id
                      ? "bg-accent text-white"
                      : "border border-ink-line text-text-dim hover:border-accent"
                  }`}
                >
                  {group.name}
                </button>
              ))}
            </div>
          )}

          {/* --- Crear --------------------------------------------------------- */}
          <form onSubmit={handleCreate} className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              aria-label={t("create.ariaLabel")}
              placeholder={t("create.placeholder")}
              className="w-full rounded-full border border-ink-line bg-ink px-4 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !name.trim()}
              aria-label={t("create.submit")}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-ink-line text-text-dim transition-colors hover:border-accent hover:text-accent-ink disabled:pointer-events-none disabled:opacity-40"
            >
              <Plus size={16} weight="bold" />
            </button>
          </form>

          {/* --- Grupo elegido ------------------------------------------------- */}
          {current && (
            <div className="mt-5 border-t border-ink-line pt-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="truncate text-[15px] font-semibold">{current.name}</h3>
                <span className="shrink-0 font-mono text-xs tabular-nums text-text-dim">
                  {t("members", { count: current.member_count })}
                </span>
              </div>

              {ranked.length > 1 ? (
                ownIndex >= 0 && (
                  <p className="mt-1 text-[13px] text-accent-ink">
                    {t("percentile", {
                      tail: tailPhrase(describeTail(rankPercentile(ownIndex + 1, ranked.length))),
                    })}
                  </p>
                )
              ) : (
                <p className="mt-1 text-[13px] leading-relaxed text-text-dim">{t("alone")}</p>
              )}

              <ol className="mt-3.5 flex flex-col gap-2.5">
                {ranked.map((row, index) => (
                  <li key={row.userId} className="flex items-baseline gap-3">
                    <span className="w-5 font-mono text-xs tabular-nums text-text-faint">
                      {index + 1}
                    </span>
                    <span
                      className={`flex-1 truncate text-sm ${row.userId === user?.id ? "font-semibold" : ""}`}
                    >
                      {row.label}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-text-dim">
                      {row.countries}
                    </span>
                  </li>
                ))}
              </ol>

              {/* --- Link de invitación ------------------------------------------ */}
              <p className="mt-5 text-[13px] font-medium">{t("inviteHeading")}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-text-faint">
                {t("inviteDetail", { name: current.name })}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  readOnly
                  value={inviteLink}
                  onFocus={(event) => event.currentTarget.select()}
                  aria-label={t("inviteLinkAriaLabel", { name: current.name })}
                  className="w-full rounded-full border border-ink-line bg-ink px-4 py-2.5 font-mono text-xs text-text focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  aria-label={t("copyLink")}
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-ink-line text-text-dim transition-colors hover:border-accent hover:text-accent-ink"
                >
                  {copied ? <Check size={16} weight="bold" /> : <Copy size={16} weight="bold" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleExit}
                disabled={busy}
                className={`mt-4 text-[13px] font-medium underline underline-offset-4 transition-opacity hover:opacity-70 disabled:pointer-events-none disabled:opacity-40 ${
                  confirmingExit ? "text-accent-ink" : "text-text-faint"
                }`}
              >
                {current.is_owner
                  ? confirmingExit
                    ? t("confirmRemove")
                    : t("remove")
                  : confirmingExit
                    ? t("confirmLeave")
                    : t("leave")}
              </button>
            </div>
          )}
        </>
      )}

      {error && <p className="mt-3 text-[13px] leading-relaxed text-accent-ink">{error}</p>}
    </section>
  );
}
