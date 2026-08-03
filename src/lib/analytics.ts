/**
 * Capa de analítica agnóstica de proveedor.
 *
 * No manda nada a ningún lado por sí sola, a propósito: elegir proveedor es una
 * decisión de producto. Lo que hace es definir el embudo y dejar un único punto
 * donde engancharlo.
 *
 * Para conectarlo:
 *  - Vercel Analytics: montá `<Analytics />` y `track()` va a usar `window.va`.
 *  - Cualquier otro: escuchá el evento `travel-tracker:event` en `window`.
 *      window.addEventListener("travel-tracker:event", (e) => posthog.capture(...))
 */

export type AnalyticsEvent =
  | "country_marked"
  | "country_unmarked"
  | "hook_shown"
  | "share_opened"
  | "share_completed"
  | "share_downloaded"
  | "save_prompt_shown"
  | "save_prompt_dismissed"
  | "signup_started"
  | "signup_completed"
  | "referral_visited"
  | "friend_connected"
  | "subdivision_marked"
  | "takeout_imported";

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

export const ANALYTICS_DOM_EVENT = "travel-tracker:event";

declare global {
  interface Window {
    va?: (command: "event", payload: { name: string } & AnalyticsProps) => void;
  }
}

export function track(event: AnalyticsEvent, props: AnalyticsProps = {}) {
  if (typeof window === "undefined") return;

  window.va?.("event", { name: event, ...props });
  window.dispatchEvent(new CustomEvent(ANALYTICS_DOM_EVENT, { detail: { event, props } }));

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, props);
  }
}
