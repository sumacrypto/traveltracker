export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "travel-tracker:theme";

/**
 * Se inyecta en el `<head>` y corre antes del primer paint. Sin esto la página
 * arranca con el tema del sistema y pega un flash al aplicar el guardado.
 */
export const THEME_INIT_SCRIPT = `
try {
  var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
  if (stored === "light" || stored === "dark") {
    document.documentElement.dataset.theme = stored;
  }
} catch (e) {}
`;

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;

  try {
    if (theme === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Modo privado o storage bloqueado: el tema igual se aplica en esta sesión.
  }
}

/** El tema que se está viendo ahora, venga de la elección del usuario o del sistema. */
export function getEffectiveTheme(): "light" | "dark" {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
