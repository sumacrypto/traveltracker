"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { UsersThree } from "@phosphor-icons/react";
import Dialog from "./Dialog";
import { SUPABASE_ENABLED } from "@/lib/supabase/client";
import { fetchProfileByReferral, redeemReferral } from "@/lib/peers";
import { rememberReferral } from "@/lib/account";
import { useAccount } from "@/lib/account";
import { track } from "@/lib/analytics";
import type { Profile } from "@/lib/supabase/types";

interface ReferralWelcomeProps {
  onSignIn: () => void;
}

type State =
  | { kind: "idle" }
  | { kind: "loading"; code: string }
  | { kind: "ready"; code: string; inviter: Profile | null };

/** Lee `?ref=` una sola vez, antes del primer render, sin pasar por un efecto. */
function readReferralCode(): string | null {
  if (typeof window === "undefined" || !SUPABASE_ENABLED) return null;
  return new URLSearchParams(window.location.search).get("ref");
}

/**
 * Lo primero que ve alguien que entra por un link de invitación (`?ref=...`).
 * Nombra a quien invita y deja elegir: conectar (para comparar mapas) o seguir
 * de largo sin conectar. Sin esto, `?ref=` se canjeaba en silencio recién al
 * registrarse, y la persona nunca se enteraba de que había una invitación.
 */
export default function ReferralWelcome({ onSignIn }: ReferralWelcomeProps) {
  const t = useTranslations("referralWelcome");
  const user = useAccount((state) => state.user);
  const [state, setState] = useState<State>(() => {
    const code = readReferralCode();
    return code ? { kind: "loading", code } : { kind: "idle" };
  });

  useEffect(() => {
    if (state.kind !== "loading") return;
    const { code } = state;

    track("referral_visited", { code });

    fetchProfileByReferral(code)
      .then((inviter) => setState({ kind: "ready", code, inviter }))
      .catch(() => setState({ kind: "ready", code, inviter: null }));
    // Solo debe correr una vez, al detectar el código: `state` no va en las
    // dependencias para no relanzar el fetch cuando pase a "ready".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.kind === "loading" ? state.code : null]);

  const dismiss = (keepCode?: string) => {
    // Se limpia el `?ref=` de la URL para que un refresh no vuelva a abrir el
    // cartel. `history.replaceState` y no un redirect: no hace falta perder el
    // resto de la navegación por esto.
    const url = new URL(window.location.href);
    url.searchParams.delete("ref");
    window.history.replaceState({}, "", url.toString());
    if (!keepCode) setState({ kind: "idle" });
  };

  const handleConnect = async () => {
    if (state.kind !== "ready") return;
    const { code } = state;

    if (!user) {
      // Sin sesión, se guarda el código para canjearlo apenas entre: es el
      // mismo mecanismo que ya usa AccountSync al iniciar sesión.
      rememberReferral(code);
      dismiss(code);
      onSignIn();
      return;
    }

    try {
      await redeemReferral(code);
      track("friend_connected", { via: "referral_welcome" });
    } catch {
      // La conexión falló pero no vale la pena bloquear a la persona por eso;
      // puede reintentar el link.
    }
    dismiss();
  };

  if (state.kind === "idle") return null;

  const inviterName =
    state.kind === "ready" ? (state.inviter?.display_name ?? state.inviter?.username) : null;

  return (
    <Dialog open onClose={() => dismiss()} title={t("title")}>
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="grid size-14 place-items-center rounded-full bg-accent/15 text-accent-ink">
          <UsersThree size={26} weight="fill" />
        </div>

        {state.kind === "loading" ? (
          <div className="skeleton h-5 w-48 rounded-full" />
        ) : (
          <p className="text-[15px] leading-snug font-semibold">
            {inviterName
              ? t.rich("invitedByName", {
                  inviterName,
                  name: (chunks) => <span className="text-accent-ink">{chunks}</span>,
                })
              : t("invitedByUnknown")}
          </p>
        )}

        <p className="text-[13px] leading-relaxed text-text-dim">{t("detail")}</p>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleConnect}
          disabled={state.kind === "loading"}
          className="rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition-opacity active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          {user ? t("connect") : t("signInAndConnect")}
        </button>
        <button
          type="button"
          onClick={() => dismiss()}
          className="rounded-full border border-ink-line px-4 py-3 text-sm font-medium text-text-dim transition-colors hover:border-accent hover:text-accent-ink"
        >
          {t("keepPrivate")}
        </button>
      </div>
    </Dialog>
  );
}
