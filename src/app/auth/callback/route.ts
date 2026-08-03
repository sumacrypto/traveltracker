import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Vuelta de la autenticación. Atiende los dos caminos, que llegan distinto:
 *
 *  - OAuth (Google) manda `?code=` y se cambia por sesión.
 *  - La confirmación de mail manda `?token_hash=` y `?type=`, y se verifica con
 *    verifyOtp. Atender solo el primero deja al que se registra por mail sin
 *    sesión después de hacer click en el link.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (!code && !(tokenHash && type)) {
    return NextResponse.redirect(`${origin}/?auth=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(`${origin}/?auth=not_configured`);
  }

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: type! });

  if (error) {
    return NextResponse.redirect(`${origin}/?auth=failed`);
  }

  // `next` viene de la URL, así que solo se aceptan rutas internas.
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return NextResponse.redirect(`${origin}${target}`);
}
