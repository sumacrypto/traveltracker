"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DownloadSimple, ShareNetwork } from "@phosphor-icons/react";
import Dialog from "./Dialog";
import {
  CARD_SIZES,
  canvasToBlob,
  drawShareCard,
  readFonts,
  readPalette,
  type CardFormat,
} from "@/lib/shareCard";
import { loadWorldShapes } from "@/lib/worldShapes";
import { track } from "@/lib/analytics";
import { useAccount } from "@/lib/account";
import type { TripStats } from "@/lib/stats";

interface ShareCardDialogProps {
  open: boolean;
  onClose: () => void;
  stats: TripStats;
  visited: Record<string, true>;
  headline: string;
}

const FILE_NAME = "mi-mapa-del-mundo.png";

export default function ShareCardDialog({
  open,
  onClose,
  stats,
  visited,
  headline,
}: ShareCardDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const referralCode = useAccount((state) => state.profile?.referral_code ?? null);

  const [format, setFormat] = useState<CardFormat>("story");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // El estado del dibujo se deriva comparando qué versión quedó pintada contra
  // la que corresponde ahora, en vez de setear "dibujando" dentro del efecto.
  const drawKey = `${format}|${stats.visited}|${headline}|${referralCode ?? ""}`;
  const [drawn, setDrawn] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const status = failed === drawKey ? "error" : drawn === drawKey ? "ready" : "drawing";

  // Redibuja al abrir y cada vez que cambia el formato. Espera a que las fuentes
  // estén cargadas: canvas no las resuelve solo y saldrían con la de respaldo.
  useEffect(() => {
    if (!open || drawn === drawKey) return;
    let active = true;

    Promise.all([loadWorldShapes(), document.fonts.ready])
      .then(([world]) => {
        const canvas = canvasRef.current;
        if (!active || !canvas) return;
        drawShareCard({
          canvas,
          format,
          world,
          visited,
          stats,
          headline,
          referralCode,
          palette: readPalette(),
          fonts: readFonts(),
        });
        setDrawn(drawKey);
      })
      .catch(() => {
        if (active) setFailed(drawKey);
      });

    return () => {
      active = false;
    };
  }, [open, drawKey, drawn, format, visited, stats, headline, referralCode]);

  const withCanvas = useCallback(async (action: (blob: Blob) => Promise<void> | void) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    setNotice(null);
    try {
      await action(await canvasToBlob(canvas));
    } catch (error) {
      // Cancelar el diálogo nativo de compartir tira AbortError: no es un fallo.
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setNotice("No pudimos generar la imagen. Probá de nuevo.");
      }
    } finally {
      setBusy(false);
    }
  }, []);

  const handleShare = () =>
    withCanvas(async (blob) => {
      const file = new File([blob], FILE_NAME, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Mi mapa del mundo" });
        track("share_completed", { format, countries: stats.visited });
        return;
      }
      // Sin Web Share API (escritorio, sobre todo) descargar es el equivalente.
      downloadBlob(blob);
      track("share_downloaded", { format, countries: stats.visited, fallback: true });
      setNotice("Tu navegador no permite compartir archivos, así que la descargamos.");
    });

  const handleDownload = () =>
    withCanvas((blob) => {
      downloadBlob(blob);
      track("share_downloaded", { format, countries: stats.visited });
    });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Compartir tu mapa"
      footer={
        <>
          {notice && <p className="mb-3 text-[13px] leading-relaxed text-text-dim">{notice}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShare}
              disabled={status !== "ready" || busy}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition-opacity active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
            >
              <ShareNetwork size={16} weight="bold" />
              Compartir
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={status !== "ready" || busy}
              aria-label="Descargar la imagen"
              className="grid size-12 shrink-0 place-items-center rounded-full border border-ink-line text-text-dim transition-colors hover:border-accent hover:text-accent-ink disabled:pointer-events-none disabled:opacity-40"
            >
              <DownloadSimple size={17} weight="bold" />
            </button>
          </div>
        </>
      }
    >
      <div role="radiogroup" aria-label="Formato" className="mb-4 flex gap-2">
        {(Object.keys(CARD_SIZES) as CardFormat[]).map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={format === option}
            onClick={() => {
              setFormat(option);
              setNotice(null);
            }}
            className={`flex-1 rounded-full border px-3 py-2 text-[13px] font-medium transition-colors ${
              format === option
                ? "border-accent text-accent-ink"
                : "border-ink-line text-text-dim hover:border-accent"
            }`}
          >
            {CARD_SIZES[option].label}
          </button>
        ))}
      </div>

      <div className="relative mx-auto max-w-64">
        {status === "error" ? (
          <p className="py-12 text-center text-sm text-text-dim">No pudimos armar la imagen.</p>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              className={`w-full rounded-[10px] border border-ink-line transition-opacity ${
                status === "ready" ? "opacity-100" : "opacity-0"
              }`}
              aria-label="Vista previa de la tarjeta"
            />
            {status !== "ready" && (
              <div
                className="skeleton absolute inset-0 rounded-[10px]"
                aria-hidden
                style={{ aspectRatio: format === "story" ? "9 / 16" : "1 / 1" }}
              />
            )}
          </>
        )}
      </div>
    </Dialog>
  );
}

function downloadBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = FILE_NAME;
  link.click();
  URL.revokeObjectURL(url);
}
