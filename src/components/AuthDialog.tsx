"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FacebookLogo, GoogleLogo } from "@phosphor-icons/react";
import Dialog from "./Dialog";
import { getSupabase } from "@/lib/supabase/client";
import { track } from "@/lib/analytics";
import { routing } from "@/i18n/routing";

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  /** Copy de contexto: cambia si viene del prompt de guardado o del menú. */
  reason?: string;
}

type Mode = "signup" | "signin";

export default function AuthDialog({ open, onClose, reason }: AuthDialogProps) {
  const t = useTranslations("authDialog");
  const locale = useLocale();
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkInbox, setCheckInbox] = useState(false);

  // El código de un solo lugar: el callback de OAuth/mail siempre vuelve a `/`
  // (inglés, el default), sin importar en qué idioma arrancó la persona. El
  // `?next=` le dice a auth/callback/route.ts a qué idioma volver.
  const callbackUrl = () => {
    const next = locale === routing.defaultLocale ? "/" : `/${locale}`;
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  };

  const handleOAuth = async (provider: "google" | "facebook") => {
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    track("signup_started", { method: provider });

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl() },
    });

    if (oauthError) {
      setError(t("oauthFailed", { provider: provider === "google" ? "Google" : "Facebook" }));
      setBusy(false);
    }
  };

  const handleEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = getSupabase();
    if (!supabase) return;

    setBusy(true);
    setError(null);
    track("signup_started", { method: "email", mode });

    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: callbackUrl() },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setError(translateAuthError(result.error.message, t));
      setBusy(false);
      return;
    }

    // Con confirmación de mail activada, signUp devuelve usuario sin sesión.
    if (mode === "signup" && !result.data.session) {
      setCheckInbox(true);
      setBusy(false);
      return;
    }

    setBusy(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("title")}>
      {checkInbox ? (
        <p className="text-sm leading-relaxed text-text-dim">
          {t.rich("checkInbox", {
            emailAddress: email,
            email: (chunks) => <span className="text-text">{chunks}</span>,
          })}
        </p>
      ) : (
        <>
          <p className="mb-5 text-sm leading-relaxed text-text-dim">
            {reason ?? t("defaultReason")}
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2.5 rounded-full border border-ink-line px-4 py-3 text-sm font-medium transition-colors hover:border-accent disabled:pointer-events-none disabled:opacity-50"
            >
              <GoogleLogo size={17} weight="bold" />
              {t("continueWithGoogle")}
            </button>

            <button
              type="button"
              onClick={() => handleOAuth("facebook")}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2.5 rounded-full border border-ink-line px-4 py-3 text-sm font-medium transition-colors hover:border-accent disabled:pointer-events-none disabled:opacity-50"
            >
              <FacebookLogo size={17} weight="bold" />
              {t("continueWithFacebook")}
            </button>
          </div>

          <div className="my-5 flex items-center gap-3 text-[11px] tracking-wide text-text-faint uppercase">
            <span className="h-px flex-1 bg-ink-line" />
            {t("or")}
            <span className="h-px flex-1 bg-ink-line" />
          </div>

          <form onSubmit={handleEmail} className="flex flex-col gap-3">
            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-medium">{t("email")}</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="rounded-full border border-ink-line bg-ink px-4 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
                placeholder={t("emailPlaceholder")}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-medium">{t("password")}</span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="rounded-full border border-ink-line bg-ink px-4 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
                placeholder={t("passwordPlaceholder")}
              />
            </label>

            {error && <p className="text-[13px] leading-relaxed text-accent-ink">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="mt-1 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition-opacity active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {mode === "signup" ? t("createAccount") : t("signIn")}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError(null);
            }}
            className="mt-4 w-full text-[13px] text-text-dim transition-colors hover:text-text"
          >
            {mode === "signup" ? t("haveAccount") : t("wantAccount")}
          </button>
        </>
      )}
    </Dialog>
  );
}

function translateAuthError(message: string, t: ReturnType<typeof useTranslations<"authDialog">>) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login")) return t("errors.invalidLogin");
  if (normalized.includes("already registered")) return t("errors.alreadyRegistered");
  if (normalized.includes("password")) return t("errors.passwordTooShort");
  return t("errors.generic");
}
