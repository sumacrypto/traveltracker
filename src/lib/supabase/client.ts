"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * La app funciona entera sin backend: el mapa, las estadísticas y la tarjeta no
 * necesitan cuenta. Todo lo que depende de Supabase se esconde si no está
 * configurado, en vez de romper.
 */
export const SUPABASE_ENABLED = Boolean(url && key);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_ENABLED) return null;
  client ??= createBrowserClient(url!, key!);
  return client;
}
