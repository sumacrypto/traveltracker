"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { applyTheme, getEffectiveTheme } from "@/lib/theme";

/**
 * Alterna claro y oscuro. Si el usuario nunca eligió, arranca siguiendo al
 * sistema; el primer click fija la preferencia y de ahí en más manda ella.
 *
 * No guarda estado: qué icono se ve lo decide el CSS con las variantes
 * `theme-light` / `theme-dark`, y el tema actual se lee del DOM al hacer click.
 * Así no hay flash del icono equivocado ni desajuste de hidratación.
 */
export default function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={() => applyTheme(getEffectiveTheme() === "dark" ? "light" : "dark")}
      aria-label="Cambiar entre modo claro y oscuro"
      title="Cambiar entre modo claro y oscuro"
      className="grid size-9 shrink-0 place-items-center rounded-full border border-ink-line text-text-dim transition-colors hover:border-accent hover:text-accent-ink active:scale-[0.94]"
    >
      <Sun size={17} weight="bold" className="hidden theme-dark:block" />
      <Moon size={17} weight="bold" className="hidden theme-light:block" />
    </button>
  );
}
