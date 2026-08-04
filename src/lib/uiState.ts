"use client";

import { create } from "zustand";

/**
 * Estado de los diálogos de cuenta (auth/perfil), separado de `Explorer.tsx`
 * porque con la pestaña de Estadísticas como ruta propia, el botón que los abre
 * (en el header compartido) ya no vive dentro de `Explorer.tsx`. No persiste:
 * son diálogos transitorios, no algo que deba sobrevivir un refresh.
 */
interface UiDialogsState {
  authOpen: boolean;
  accountOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  openAccount: () => void;
  closeAccount: () => void;
}

export const useUiDialogs = create<UiDialogsState>()((set) => ({
  authOpen: false,
  accountOpen: false,
  openAuth: () => set({ authOpen: true }),
  closeAuth: () => set({ authOpen: false }),
  openAccount: () => set({ accountOpen: true }),
  closeAccount: () => set({ accountOpen: false }),
}));
