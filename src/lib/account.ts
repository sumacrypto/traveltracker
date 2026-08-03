"use client";

import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "./supabase/types";

export type SyncStatus = "anon" | "loading" | "synced" | "error";

interface AccountState {
  user: User | null;
  profile: Profile | null;
  status: SyncStatus;
  set: (partial: Partial<Omit<AccountState, "set">>) => void;
}

export const useAccount = create<AccountState>()((set) => ({
  user: null,
  profile: null,
  status: "anon",
  set: (partial) => set(partial),
}));

/** Código de referido pendiente de canjear, capturado del `?ref=` de la URL. */
const PENDING_REFERRAL_KEY = "travel-tracker:pending-referral";

export function rememberReferral(code: string) {
  try {
    sessionStorage.setItem(PENDING_REFERRAL_KEY, code);
  } catch {
    // Storage bloqueado: se pierde el referido, no es crítico.
  }
}

export function takePendingReferral(): string | null {
  try {
    const code = sessionStorage.getItem(PENDING_REFERRAL_KEY);
    if (code) sessionStorage.removeItem(PENDING_REFERRAL_KEY);
    return code;
  } catch {
    return null;
  }
}
