"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Copy, SignOut, Trophy } from "@phosphor-icons/react";
import Dialog from "./Dialog";
import CountryPicker from "./CountryPicker";
import { getSupabase } from "@/lib/supabase/client";
import { useAccount } from "@/lib/account";
import {
  acceptRequest,
  fetchLeaderboard,
  fetchPendingRequests,
  rankLeaderboard,
  LEADERBOARD_TABS,
  type PendingRequest,
} from "@/lib/peers";
import { describeTail, rankPercentile, type TailDescriptor } from "@/lib/stats";
import { track } from "@/lib/analytics";
import type { Continent } from "@/data/countries";
import type { LeaderboardRow, Profile } from "@/lib/supabase/types";

interface AccountDialogProps {
  open: boolean;
  onClose: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();

export default function AccountDialog({ open, onClose }: AccountDialogProps) {
  const t = useTranslations("accountDialog");
  return (
    <Dialog open={open} onClose={onClose} title={t("title")}>
      {/* El cuerpo se monta recién al abrir, así el formulario nace ya cargado
          con el perfil en vez de tener que sincronizarse desde un efecto. */}
      <AccountDialogBody onClose={onClose} />
    </Dialog>
  );
}

function AccountDialogBody({ onClose }: { onClose: () => void }) {
  const t = useTranslations("accountDialog");
  const tc = useTranslations("common.continents");
  const locale = useLocale();
  const user = useAccount((state) => state.user);
  const profile = useAccount((state) => state.profile);
  const setAccount = useAccount((state) => state.set);

  const [form, setForm] = useState(() => ({
    display_name: profile?.display_name ?? "",
    username: profile?.username ?? "",
    home_country: profile?.home_country ?? "",
    home_city: profile?.home_city ?? "",
    birth_year: profile?.birth_year ? String(profile.birth_year) : "",
    is_public: profile?.is_public ?? true,
  }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [tab, setTab] = useState<Continent | "general">("general");

  const loadSocial = useCallback(() => {
    if (!user) return;
    Promise.all([fetchLeaderboard(), fetchPendingRequests(user.id)])
      .then(([rows, pending]) => {
        setLeaderboard(rows);
        setRequests(pending);
      })
      .catch(() => {
        // El ranking es accesorio: si falla, el resto del diálogo sigue sirviendo.
      });
  }, [user]);

  useEffect(loadSocial, [loadSocial]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = getSupabase();
    if (!supabase || !user) return;

    setSaving(true);
    setError(null);

    const payload = {
      display_name: form.display_name.trim() || null,
      username: form.username.trim().toLowerCase() || null,
      home_country: form.home_country || null,
      home_city: form.home_city.trim() || null,
      birth_year: form.birth_year ? Number(form.birth_year) : null,
      is_public: form.is_public,
    };

    const { data, error: updateError } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.code === "23505" ? t("errors.usernameTaken") : t("errors.saveFailed"));
      setSaving(false);
      return;
    }

    setAccount({ profile: data as Profile });
    setSaving(false);
    setSaved(true);
  };

  const referralLink = profile
    ? `${typeof window === "undefined" ? "" : window.location.origin}/?ref=${profile.referral_code}`
    : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setError(t("errors.copyFailed"));
    }
  };

  const handleAccept = async (request: PendingRequest) => {
    try {
      await acceptRequest(request.id);
      track("friend_connected", {});
      loadSocial();
    } catch {
      setError(t("errors.acceptFailed"));
    }
  };

  const signOut = async () => {
    await getSupabase()?.auth.signOut();
    onClose();
  };

  return (
    <>
      <form onSubmit={handleSave} className="flex flex-col gap-3.5">
        <Field label={t("displayName")}>
          <input
            type="text"
            value={form.display_name}
            onChange={(event) => setForm({ ...form, display_name: event.target.value })}
            className={inputClass}
            placeholder={t("displayNamePlaceholder")}
          />
        </Field>

        <Field label={t("username")} hint={t("usernameHint")}>
          <input
            type="text"
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            pattern="[a-zA-Z0-9_]{3,20}"
            title={t("usernamePattern")}
            className={inputClass}
            placeholder={t("usernamePlaceholder")}
          />
        </Field>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-medium">{t("homeCountry")}</span>
          <CountryPicker
            value={form.home_country || null}
            onChange={(code) => setForm({ ...form, home_country: code ?? "" })}
            label={t("homeCountry")}
            clearLabel={t("preferNotToSay")}
          />
          <span className="text-[12px] leading-relaxed text-text-faint">
            {t("homeCountryHint")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("city")}>
            <input
              type="text"
              value={form.home_city}
              onChange={(event) => setForm({ ...form, home_city: event.target.value })}
              className={inputClass}
              placeholder={t("cityPlaceholder")}
            />
          </Field>

          <Field label={t("birthYear")}>
            <input
              type="number"
              min={1900}
              max={CURRENT_YEAR}
              value={form.birth_year}
              onChange={(event) => setForm({ ...form, birth_year: event.target.value })}
              className={inputClass}
              placeholder="1990"
            />
          </Field>
        </div>

        <label className="flex items-start gap-2.5 py-1">
          <input
            type="checkbox"
            checked={form.is_public}
            onChange={(event) => setForm({ ...form, is_public: event.target.checked })}
            className="mt-0.5 size-4 accent-[var(--accent)]"
          />
          <span className="text-[13px] leading-relaxed text-text-dim">{t("publicHint")}</span>
        </label>

        {error && <p className="text-[13px] leading-relaxed text-accent-ink">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-1 flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          {saved && <Check size={15} weight="bold" />}
          {saved ? t("saved") : t("save")}
        </button>
      </form>

      {/* --- Invitar ---------------------------------------------------------- */}
      <section className="mt-7 border-t border-ink-line pt-6">
        <h3 className="text-[15px] font-semibold">{t("inviteHeading")}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-text-dim">{t("inviteDetail")}</p>

        <div className="mt-3 flex items-center gap-2">
          <input
            readOnly
            value={referralLink}
            onFocus={(event) => event.currentTarget.select()}
            className={`${inputClass} font-mono text-xs`}
            aria-label={t("inviteLinkAriaLabel")}
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
      </section>

      {/* --- Invitaciones recibidas ------------------------------------------- */}
      {requests.length > 0 && (
        <section className="mt-7 border-t border-ink-line pt-6">
          <h3 className="text-[15px] font-semibold">{t("requestsHeading")}</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {requests.map((request) => (
              <li key={request.id} className="flex items-center gap-3">
                <span className="flex-1 truncate text-sm">
                  {request.display_name ?? request.username ?? t("someone")}
                </span>
                <button
                  type="button"
                  onClick={() => handleAccept(request)}
                  className="rounded-full border border-ink-line px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent hover:text-accent-ink"
                >
                  {t("accept")}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* --- Amigos y ranking --------------------------------------------------
          El ranking se recalcula en el cliente a partir de country_codes: así
          "por continente" no depende de que el servidor conozca los continentes,
          y agregar una pestaña nueva no toca la base. */}
      {leaderboard.length > 1 &&
        (() => {
          const ranked = rankLeaderboard(
            leaderboard,
            tab,
            (row) =>
              row.user_id === user?.id
                ? t("you")
                : (row.display_name ?? row.username ?? t("noName")),
            locale,
          );
          const ownIndex = ranked.findIndex((row) => row.userId === user?.id);

          // "en el X%" es una frase entera armada por idioma (ver
          // PeerComparison.tsx), no un fragmento pegado a mano.
          const tailPhrase = (tail: TailDescriptor) =>
            tail.tier === "underTenth" ? t("tail.underTenth") : t("tail.top", { value: tail.value ?? 0 });

          return (
            <section className="mt-7 border-t border-ink-line pt-6">
              <h3 className="flex items-center gap-2 text-[15px] font-semibold">
                <Trophy size={16} weight="fill" className="text-accent" />
                {t("friendsHeading")}
              </h3>

              {ownIndex >= 0 && (
                <p className="mt-1 text-[13px] text-accent-ink">
                  {t("friendsPercentile", {
                    tail: tailPhrase(describeTail(rankPercentile(ownIndex + 1, ranked.length))),
                  })}
                </p>
              )}

              <div
                role="tablist"
                aria-label={t("rankingByAriaLabel")}
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
            </section>
          );
        })()}

      <button
        type="button"
        onClick={signOut}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-full border border-ink-line px-4 py-2.5 text-sm font-medium text-text-dim transition-colors hover:border-accent hover:text-accent-ink"
      >
        <SignOut size={15} weight="bold" />
        {t("signOut")}
      </button>
    </>
  );
}

const inputClass =
  "w-full rounded-full border border-ink-line bg-ink px-4 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13px] font-medium">{label}</span>
      {children}
      {hint && <span className="text-[12px] leading-relaxed text-text-faint">{hint}</span>}
    </label>
  );
}
