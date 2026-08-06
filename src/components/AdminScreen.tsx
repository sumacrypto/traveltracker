"use client";

import { useEffect, useState } from "react";
import { useAccount } from "@/lib/account";
import { useUiDialogs } from "@/lib/uiState";
import { SUPABASE_ENABLED } from "@/lib/supabase/client";
import { checkIsAdmin, fetchAdminProfiles, type AdminProfileRow } from "@/lib/admin";

type AsyncState =
  | { kind: "loading" }
  | { kind: "unauthorized" }
  | { kind: "ready"; rows: AdminProfileRow[] }
  | { kind: "error" };

/**
 * Página interna, solo para el dueño de la app — no pasa por next-intl a
 * propósito, no es contenido de cara al usuario. Lo que la protege de verdad
 * es is_admin() del lado de la base (supabase/migrations/0008_admin.sql):
 * esta pantalla solo decide qué mostrar según lo que esa función responde,
 * no hace ningún chequeo que valga como seguridad por sí solo.
 */
export default function AdminScreen() {
  const user = useAccount((state) => state.user);
  const openAuth = useUiDialogs((state) => state.openAuth);
  const [asyncState, setAsyncState] = useState<AsyncState>({ kind: "loading" });

  useEffect(() => {
    // Sin cuenta no hay nada que pedirle a is_admin(): se deriva más abajo,
    // sin pasar por setState acá (el efecto no tiene nada que sincronizar en
    // ese caso, así que no corre nada).
    if (!SUPABASE_ENABLED || !user) return;

    let active = true;
    checkIsAdmin()
      .then((ok) => {
        if (!active) return;
        if (!ok) {
          setAsyncState({ kind: "unauthorized" });
          return;
        }
        return fetchAdminProfiles().then((rows) => {
          if (active) setAsyncState({ kind: "ready", rows });
        });
      })
      .catch(() => {
        if (active) setAsyncState({ kind: "error" });
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (!SUPABASE_ENABLED) return null;

  const state: AsyncState = !user ? { kind: "unauthorized" } : asyncState;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 overflow-y-auto p-5 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-text-dim">Gente que se fue registrando.</p>
      </div>

      {state.kind === "loading" && <div className="skeleton h-24 w-full rounded-xl" />}

      {state.kind === "unauthorized" && (
        <section className="surface p-5">
          <p className="text-[15px] font-semibold">No tenés acceso a esta página.</p>
          {!user && (
            <button
              type="button"
              onClick={openAuth}
              className="mt-3 text-[13px] font-medium text-accent-ink underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              Iniciar sesión
            </button>
          )}
        </section>
      )}

      {state.kind === "error" && (
        <p className="text-[13px] leading-relaxed text-accent-ink">No pudimos cargar la lista.</p>
      )}

      {state.kind === "ready" && (
        <section className="surface overflow-x-auto p-5">
          <p className="mb-3 text-sm text-text-dim">
            {state.rows.length} {state.rows.length === 1 ? "perfil" : "perfiles"}
          </p>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-line text-xs text-text-faint uppercase">
                <th className="pb-2 pr-3 font-semibold">Nombre</th>
                <th className="pb-2 pr-3 font-semibold">Usuario</th>
                <th className="pb-2 pr-3 font-semibold">Email</th>
                <th className="pb-2 pr-3 font-semibold">País</th>
                <th className="pb-2 pr-3 font-semibold">Países</th>
                <th className="pb-2 pr-3 font-semibold">Público</th>
                <th className="pb-2 font-semibold">Registrado</th>
              </tr>
            </thead>
            <tbody>
              {state.rows.map((row) => (
                <tr key={row.id} className="border-b border-ink-line/60">
                  <td className="py-2 pr-3">{row.display_name ?? "—"}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{row.username ?? "—"}</td>
                  <td className="py-2 pr-3 text-text-dim">{row.email ?? "—"}</td>
                  <td className="py-2 pr-3">{row.home_country ?? "—"}</td>
                  <td className="py-2 pr-3 font-mono tabular-nums">{row.countries}</td>
                  <td className="py-2 pr-3">{row.is_public ? "sí" : "no"}</td>
                  <td className="py-2 text-text-dim">
                    {new Date(row.created_at).toLocaleDateString("es")}
                  </td>
                </tr>
              ))}
              {state.rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-text-dim">
                    Todavía no se registró nadie.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
