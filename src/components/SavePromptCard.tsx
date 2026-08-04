"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { CloudArrowUp, X } from "@phosphor-icons/react";
import { useAccount } from "@/lib/account";
import { SUPABASE_ENABLED } from "@/lib/supabase/client";
import { SAVE_PROMPT_THRESHOLD } from "@/lib/stats";
import { track } from "@/lib/analytics";

const DISMISSED_KEY = "travel-tracker:save-prompt-dismissed";

interface SavePromptCardProps {
  visited: number;
  onSignIn: () => void;
}

/**
 * Aparece recién cuando ya hay progreso que valga la pena perder. Vive dentro
 * del panel y no como modal a propósito: interrumpir a alguien en la mitad de
 * marcar países es la forma más rápida de que cierre la pestaña.
 */
export default function SavePromptCard({ visited, onSignIn }: SavePromptCardProps) {
  const t = useTranslations("savePromptCard");
  const user = useAccount((state) => state.user);
  const reduce = useReducedMotion();
  // En el servidor arranca descartado. No genera desajuste de hidratación porque
  // el progreso también se rehidrata en el cliente: hasta entonces `visited` es 0
  // y la tarjeta no se dibuja de ninguna manera.
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  const shouldShow =
    SUPABASE_ENABLED && !user && !dismissed && visited >= SAVE_PROMPT_THRESHOLD;

  useEffect(() => {
    if (shouldShow) track("save_prompt_shown", { countries: visited });
    // Solo interesa la primera vez que cruza el umbral, no cada país nuevo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShow]);

  if (!shouldShow) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Sin storage vuelve a aparecer en la próxima visita: aceptable.
    }
    track("save_prompt_dismissed", { countries: visited });
  };

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="surface relative border-accent/40 p-4"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("notNow")}
        className="absolute top-3 right-3 grid size-7 place-items-center rounded-full text-text-faint transition-colors hover:text-text"
      >
        <X size={13} weight="bold" />
      </button>

      <p className="pr-8 text-[15px] leading-snug font-semibold">
        {t("headline", { count: visited })}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-text-dim">{t("detail")}</p>

      <button
        type="button"
        onClick={onSignIn}
        className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity active:scale-[0.98]"
      >
        <CloudArrowUp size={16} weight="bold" />
        {t("save")}
      </button>
    </motion.section>
  );
}
