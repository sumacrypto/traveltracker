import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Vuelta del OAuth. Cambia el código por sesión y manda a la home, donde el
 * cliente detecta que hay usuario y sincroniza el progreso local.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/?auth=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(`${origin}/?auth=not_configured`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/?auth=failed`);
  }

  // `next` viene de la URL, así que solo se aceptan rutas internas.
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return NextResponse.redirect(`${origin}${target}`);
}
