"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import AppHeader from "./AppHeader";
import AccountSync from "./AccountSync";
import ReferralWelcome from "./ReferralWelcome";
import AuthDialog from "./AuthDialog";
import AccountDialog from "./AccountDialog";
import { useTrip } from "@/lib/store";
import { computeStats } from "@/lib/stats";
import { useUiDialogs } from "@/lib/uiState";

/**
 * Todo lo que `/` y `/stats` comparten: header, sincronización de cuenta, y
 * los diálogos de auth/perfil. Antes vivía adentro de `Explorer.tsx`, que era
 * dueño de todo el shell porque el mapa era la única pantalla; con
 * Estadísticas como ruta propia, esto sube al layout para que las dos rutas
 * lo compartan en vez de duplicarlo.
 */
export default function AppChrome({ children }: { children: React.ReactNode }) {
  const t = useTranslations("explorer");
  const visited = useTrip((state) => state.visited);
  const authOpen = useUiDialogs((state) => state.authOpen);
  const closeAuth = useUiDialogs((state) => state.closeAuth);
  const accountOpen = useUiDialogs((state) => state.accountOpen);
  const closeAccount = useUiDialogs((state) => state.closeAccount);
  const openAuth = useUiDialogs((state) => state.openAuth);

  // Solo hace falta la cantidad para el motivo del login, así que no vale la
  // pena mandar TripStats entero por acá: se recalcula liviano.
  const visitedCount = useMemo(() => computeStats(Object.keys(visited)).visited, [visited]);

  return (
    // min-h en mobile a propósito: ahí la idea es que la página entera scrollee
    // de un tirón. Pero sin un h fijo en desktop, min-height nunca frena: el
    // contenedor crece con el contenido y termina siendo TODA la página la que
    // scrollea, en vez de que el panel lateral del mapa scrollee solo dentro de
    // su propio recuadro (ver el mismo comentario, antes en Explorer.tsx).
    <div className="flex min-h-[100dvh] flex-col lg:h-[100dvh]">
      <AccountSync />
      <AppHeader />

      {children}

      <ReferralWelcome onSignIn={openAuth} />

      <AuthDialog
        open={authOpen}
        onClose={closeAuth}
        reason={visitedCount > 0 ? t("authReason", { count: visitedCount }) : undefined}
      />

      <AccountDialog open={accountOpen} onClose={closeAccount} />
    </div>
  );
}
