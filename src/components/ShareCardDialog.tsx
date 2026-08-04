"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { DownloadSimple, ShareNetwork } from "@phosphor-icons/react";
import Dialog from "./Dialog";
import {
  CARD_SIZES,
  buildInviteLine,
  canvasToBlob,
  drawShareCard,
  readFonts,
  readPalette,
  type CardFormat,
  type ShareCardCopy,
} from "@/lib/shareCard";
import { loadWorldShapes } from "@/lib/worldShapes";
import { track } from "@/lib/analytics";
import { useAccount } from "@/lib/account";
import type { TripStats } from "@/lib/stats";
import { CONTINENTS } from "@/data/countries";

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
  // Con nombre, la invitación pega más fuerte: "Federico visitó 51 países,
  // ¿y tú?" da curiosidad de un modo que "¿cuántos llevas?" genérico no da.
  // Sin sesión (o sin nombre cargado) se cae a la pregunta genérica.
  const displayName = useAccount(
    (state) => state.profile?.display_name ?? state.profile?.username ?? null,
  );
  const locale = useLocale();
  const t = useTranslations("shareCardDialog");
  const tCard = useTranslations("shareCard");
  const tc = useTranslations("common.continents");

  const [format, setFormat] = useState<CardFormat>("story");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const inviteLink = buildInviteLine(referralCode);

  // El canvas no tiene locale propio (ver ShareCardCopy en shareCard.ts): se
  // arma acá una sola vez por locale, no en cada país que la persona marca.
  const copy = useMemo<ShareCardCopy>(
    () => ({
      brandWordmark: tCard("brandWordmark"),
      countriesVisitedLabel: tCard("countriesVisitedLabel"),
      percentOfWorld: tCard("percentOfWorld"),
      inviteQuestion: displayName
        ? tCard("inviteQuestionNamed", { name: displayName, count: stats.visited })
        : tCard("inviteQuestion"),
      numberLocale: locale,
      continentLabels: Object.fromEntries(CONTINENTS.map((id) => [id, tc(id)])),
    }),
    [tCard, tc, locale, displayName, stats.visited],
  );

  // El estado del dibujo se deriva comparando qué versión quedó pintada contra
  // la que corresponde ahora, en vez de setear "dibujando" dentro del efecto.
  const drawKey = `${format}|${stats.visited}|${headline}|${referralCode ?? ""}|${locale}|${displayName ?? ""}`;
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
          copy,
        });
        setDrawn(drawKey);
      })
      .catch(() => {
        if (active) setFailed(drawKey);
      });

    return () => {
      active = false;
    };
  }, [open, drawKey, drawn, format, visited, stats, headline, referralCode, copy]);

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
        setNotice(t("generateFailed"));
      }
    } finally {
      setBusy(false);
    }
  }, [t]);

  const handleShare = () =>
    withCanvas(async (blob) => {
      const file = new File([blob], FILE_NAME, { type: "image/png" });
      // La imagen sola nunca es clickeable (ni acá ni en Instagram Stories: eso
      // Instagram solo lo permite agregando a mano un sticker de link después de
      // publicar, no hay forma de lograrlo desde afuera). Lo que sí está en
      // nuestras manos es que el link viaje como link de verdad, no solo como
      // píxeles: `text`/`url` van aparte de `files` para que la app que reciba
      // el compartir (WhatsApp, X, Mensajes...) arme un link tocable de verdad.
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: t("nativeShareTitle"),
          text: copy.inviteQuestion,
          url: inviteLink,
        });
        track("share_completed", { format, countries: stats.visited });
        return;
      }
      // Sin Web Share API (escritorio, sobre todo) descargar es el equivalente;
      // el texto con el link se copia al portapapeles para que se pueda pegar
      // donde se termine posteando la imagen.
      downloadBlob(blob);
      await copyInviteText(`${copy.inviteQuestion}${inviteLink}`);
      track("share_downloaded", { format, countries: stats.visited, fallback: true });
      setNotice(t("noWebShare"));
    });

  const handleDownload = () =>
    withCanvas(async (blob) => {
      downloadBlob(blob);
      await copyInviteText(`${copy.inviteQuestion}${inviteLink}`);
      track("share_downloaded", { format, countries: stats.visited });
      setNotice(t("downloadedWithCopy"));
    });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("title")}
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
              {t("share")}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={status !== "ready" || busy}
              aria-label={t("downloadAriaLabel")}
              className="grid size-12 shrink-0 place-items-center rounded-full border border-ink-line text-text-dim transition-colors hover:border-accent hover:text-accent-ink disabled:pointer-events-none disabled:opacity-40"
            >
              <DownloadSimple size={17} weight="bold" />
            </button>
          </div>
        </>
      }
    >
      <div role="radiogroup" aria-label={t("formatAriaLabel")} className="mb-4 flex gap-2">
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
          <p className="py-12 text-center text-sm text-text-dim">{t("buildFailed")}</p>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              className={`w-full rounded-[10px] border border-ink-line transition-opacity ${
                status === "ready" ? "opacity-100" : "opacity-0"
              }`}
              aria-label={t("previewAriaLabel")}
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

/**
 * Sin Web Share, la imagen se descarga sola: sin esto la persona tiene que
 * volver a escribir el link a mano en el pie de la foto. Falla en silencio a
 * propósito: la descarga ya fue exitosa, esto es un extra, no vale la pena
 * mostrar un error si el portapapeles no está disponible.
 */
async function copyInviteText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // sin portapapeles disponible, no hay nada más para hacer acá
  }
}
