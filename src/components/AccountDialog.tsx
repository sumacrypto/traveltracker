"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, SignOut, UsersThree } from "@phosphor-icons/react";
import Dialog from "./Dialog";
import CountryPicker from "./CountryPicker";
import { Link } from "@/i18n/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { useAccount } from "@/lib/account";
import type { Profile } from "@/lib/supabase/types";

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

  const signOut = async () => {
    await getSupabase()?.auth.signOut();
    onClose();
  };

  return (
    <>
      <form onSubmit={handleSave} className="flex flex-col gap-3.5">
        {/* El mail vive en auth.users, no en profiles — no hay nada que
            guardar acá, así que va aparte del form y siempre readOnly. */}
        {user?.email && (
          <Field label={t("email")}>
            <input
              type="email"
              value={user.email}
              readOnly
              disabled
              className={`${inputClass} cursor-not-allowed opacity-60`}
            />
          </Field>
        )}

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

      {/* El ranking de amigos y las solicitudes vivían acá; ahora tienen su
          propia pestaña (junto con agregar gente por nombre de usuario), así
          que este diálogo se queda enfocado en el perfil y este es el puente
          hacia allá. */}
      <Link
        href="/friends"
        onClick={onClose}
        className="mt-7 flex items-center justify-center gap-2 rounded-full border border-ink-line px-4 py-2.5 text-sm font-medium text-text-dim transition-colors hover:border-accent hover:text-accent-ink"
      >
        <UsersThree size={15} weight="bold" />
        {t("seeFriends")}
      </Link>

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
