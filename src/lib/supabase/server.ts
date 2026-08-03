import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_ENABLED_SERVER = Boolean(url && key);

/**
 * Solo se usa en el route handler del callback de OAuth: ahí hay que escribir la
 * cookie de sesión desde el servidor. El resto de la app lee la sesión desde el
 * cliente, así que no hace falta middleware para refrescar tokens.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  if (!SUPABASE_ENABLED_SERVER) return null;
  const store = await cookies();

  return createServerClient(url!, key!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value, options } of cookiesToSet) {
          store.set(name, value, options);
        }
      },
    },
  });
}
