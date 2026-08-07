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

/**
 * Código de referido capturado de la URL que no se puede canjear todavía
 * porque no hay sesión. Sobrevive la ida y vuelta al proveedor de auth (mismo
 * tab, mismo origen) y lo retira AccountSync apenas hay usuario.
 */
const PENDING_REFERRAL_KEY = "travel-tracker:pending-referral";

function remember(key: string, code: string) {
  try {
    sessionStorage.setItem(key, code);
  } catch {
    // Storage bloqueado: se pierde la invitación, no es crítico.
  }
}

function take(key: string): string | null {
  try {
    const code = sessionStorage.getItem(key);
    if (code) sessionStorage.removeItem(key);
    return code;
  } catch {
    return null;
  }
}

/** Del `?ref=` de la URL: conecta 1 a 1 con quien invitó. */
export function rememberReferral(code: string) {
  remember(PENDING_REFERRAL_KEY, code);
}

export function takePendingReferral(): string | null {
  return take(PENDING_REFERRAL_KEY);
}
