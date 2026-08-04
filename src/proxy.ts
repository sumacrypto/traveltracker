import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renombró `middleware.ts` a `proxy.ts` (la función debe
// llamarse `proxy`, no `middleware`): node_modules/next/dist/docs/.../proxy.md.
export const proxy = createMiddleware(routing);

export const config = {
  // Excluye /api, /auth (callback de OAuth/OTP de Supabase, tiene que quedar
  // sin prefijo de idioma o el redirect de Google se rompe), los internos de
  // Next y cualquier archivo estático.
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
