"use client";

import { useState } from "react";
import { GoogleLogo } from "@phosphor-icons/react";
import Dialog from "./Dialog";
import { getSupabase } from "@/lib/supabase/client";
import { track } from "@/lib/analytics";

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  /** Copy de contexto: cambia si viene del prompt de guardado o del menú. */
  reason?: string;
}

type Mode = "signup" | "signin";

export default function AuthDialog({ open, onClose, reason }: AuthDialogProps) {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkInbox, setCheckInbox] = useState(false);

  const handleGoogle = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    track("signup_started", { method: "google" });

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (oauthError) {
      setError("No pudimos abrir el login de Google.");
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
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setError(translateAuthError(result.error.message));
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
    <Dialog open={open} onClose={onClose} title="Guardar tu progreso">
      {checkInbox ? (
        <p className="text-sm leading-relaxed text-text-dim">
          Te mandamos un mail a <span className="text-text">{email}</span> para confirmar la
          cuenta. Abrilo y volvés acá con todo guardado.
        </p>
      ) : (
        <>
          <p className="mb-5 text-sm leading-relaxed text-text-dim">
            {reason ??
              "Con una cuenta tu mapa te sigue entre dispositivos y podés comparar con tus amigos."}
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-ink-line px-4 py-3 text-sm font-medium transition-colors hover:border-accent disabled:pointer-events-none disabled:opacity-50"
          >
            <GoogleLogo size={17} weight="bold" />
            Continuar con Google
          </button>

          <div className="my-5 flex items-center gap-3 text-[11px] tracking-wide text-text-faint uppercase">
            <span className="h-px flex-1 bg-ink-line" />o<span className="h-px flex-1 bg-ink-line" />
          </div>

          <form onSubmit={handleEmail} className="flex flex-col gap-3">
            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-medium">Mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="rounded-full border border-ink-line bg-ink px-4 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
                placeholder="vos@mail.com"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-medium">Contraseña</span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="rounded-full border border-ink-line bg-ink px-4 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
                placeholder="Mínimo 8 caracteres"
              />
            </label>

            {error && <p className="text-[13px] leading-relaxed text-accent-ink">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="mt-1 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition-opacity active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {mode === "signup" ? "Crear cuenta" : "Entrar"}
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
            {mode === "signup" ? "Ya tengo cuenta" : "Quiero crear una cuenta"}
          </button>
        </>
      )}
    </Dialog>
  );
}

function translateAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login")) return "Mail o contraseña incorrectos.";
  if (normalized.includes("already registered")) return "Ese mail ya tiene cuenta. Probá entrar.";
  if (normalized.includes("password")) return "La contraseña tiene que tener al menos 8 caracteres.";
  return "No pudimos completar el paso. Probá de nuevo.";
}
