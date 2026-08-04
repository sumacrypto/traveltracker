"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { X } from "@phosphor-icons/react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Shell común de los diálogos: overlay, cierre con Escape y con click afuera,
 * bloqueo del scroll de fondo y devolución del foco al cerrar. En mobile entra
 * desde abajo, que es donde llega el pulgar.
 */
export default function Dialog({ open, onClose, title, children, footer }: DialogProps) {
  const t = useTranslations("common");
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusTo = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocusTo.current = document.activeElement;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      (returnFocusTo.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="surface flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-b-none sm:rounded-b-[14px]"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-ink-line px-5 py-4">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="grid size-8 place-items-center rounded-full text-text-dim transition-colors hover:text-text"
          >
            <X size={16} weight="bold" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {footer && <footer className="shrink-0 border-t border-ink-line p-5">{footer}</footer>}
      </div>
    </div>
  );
}
