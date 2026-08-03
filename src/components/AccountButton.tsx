"use client";

import { UserCircle } from "@phosphor-icons/react";
import { useAccount } from "@/lib/account";
import { SUPABASE_ENABLED } from "@/lib/supabase/client";

interface AccountButtonProps {
  onSignIn: () => void;
  onOpenAccount: () => void;
}

export default function AccountButton({ onSignIn, onOpenAccount }: AccountButtonProps) {
  const user = useAccount((state) => state.user);
  const profile = useAccount((state) => state.profile);

  // Sin backend configurado no tiene sentido ofrecer cuenta.
  if (!SUPABASE_ENABLED) return null;

  if (!user) {
    return (
      <button
        type="button"
        onClick={onSignIn}
        className="shrink-0 rounded-full border border-ink-line px-3.5 py-2 text-[13px] font-medium text-text-dim transition-colors hover:border-accent hover:text-accent-ink active:scale-[0.98]"
      >
        Entrar
      </button>
    );
  }

  const label = profile?.display_name ?? profile?.username ?? user.email ?? "Tu cuenta";

  return (
    <button
      type="button"
      onClick={onOpenAccount}
      aria-label="Tu cuenta"
      title={label}
      className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-ink-line text-text-dim transition-colors hover:border-accent hover:text-accent-ink active:scale-[0.94]"
    >
      {profile?.avatar_url ? (
        // Avatar de Google: viene de un host externo, así que no pasa por
        // next/image para no tener que declarar dominios remotos.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatar_url} alt="" className="size-full object-cover" />
      ) : (
        <UserCircle size={19} weight="bold" />
      )}
    </button>
  );
}
