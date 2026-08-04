"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, LockSimple, UploadSimple } from "@phosphor-icons/react";
import Dialog from "./Dialog";
import { loadWorldShapes } from "@/lib/worldShapes";
import { extractPoints, matchCountries } from "@/lib/takeout";
import { COUNTRIES } from "@/data/countries";
import { countryLabel } from "@/lib/countryLabel";
import { useTrip } from "@/lib/store";
import { track } from "@/lib/analytics";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

type Status =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "done"; added: string[]; already: number; points: number }
  | { kind: "error"; message: string };

export default function ImportDialog({ open, onClose }: ImportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const locale = useLocale();
  const t = useTranslations("importDialog");

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setStatus({ kind: "working" });

    try {
      const world = await loadWorldShapes();
      const points: [number, number][] = [];

      for (const file of Array.from(files)) {
        const text = await file.text();
        points.push(...extractPoints(JSON.parse(text)));
      }

      if (points.length === 0) {
        setStatus({ kind: "error", message: t("errors.noLocations") });
        return;
      }

      const result = matchCountries(points, world.shapes);
      const visited = useTrip.getState().visited;
      const nuevos = result.countryIds.filter((id) => !visited[id]);

      for (const id of nuevos) useTrip.getState().toggle(id);

      track("takeout_imported", {
        points: result.points,
        countries: result.countryIds.length,
        added: nuevos.length,
      });

      setStatus({
        kind: "done",
        added: nuevos,
        already: result.countryIds.length - nuevos.length,
        points: result.points,
      });
    } catch {
      setStatus({ kind: "error", message: t("errors.readFailed") });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={t("title")}>
      {status.kind === "done" ? (
        <>
          <p className="flex items-center gap-2 text-[15px] font-semibold text-accent-ink">
            <Check size={17} weight="bold" />
            {status.added.length === 0
              ? t("noNewCountries")
              : t("addedCountries", { count: status.added.length })}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-text-dim">
            {status.already > 0
              ? t("readSummaryWithAlready", {
                  points: status.points.toLocaleString(locale),
                  already: status.already,
                })
              : t("readSummaryOnly", { points: status.points.toLocaleString(locale) })}
          </p>

          {status.added.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {status.added.map((id) => (
                <li
                  key={id}
                  className="rounded-full border border-ink-line px-2.5 py-1 text-[12px]"
                >
                  {COUNTRIES[id]?.flag} {COUNTRIES[id] ? countryLabel(COUNTRIES[id], locale) : id}
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition-opacity active:scale-[0.98]"
          >
            {t("done")}
          </button>
        </>
      ) : (
        <>
          <p className="text-[13px] leading-relaxed text-text-dim">{t("intro")}</p>

          <ol className="mt-4 flex flex-col gap-2.5 text-[13px] leading-relaxed text-text-dim">
            {[
              t.rich("steps.first", { b: (chunks) => <span className="text-text">{chunks}</span> }),
              t.rich("steps.second", { b: (chunks) => <span className="text-text">{chunks}</span> }),
              t.rich("steps.third", { b: (chunks) => <span className="text-text">{chunks}</span> }),
              t("steps.fourth"),
            ].map((step, index) => (
              <li key={index} className="flex gap-2.5">
                <span className="font-mono text-text-faint tabular-nums">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <p className="mt-4 flex items-start gap-2 rounded-[10px] border border-ink-line bg-ink p-3 text-[12px] leading-relaxed text-text-dim">
            <LockSimple size={14} weight="bold" className="mt-0.5 shrink-0 text-accent-ink" />
            {t("privacyNote")}
          </p>

          {status.kind === "error" && (
            <p className="mt-3 text-[13px] leading-relaxed text-accent-ink">{status.message}</p>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            multiple
            hidden
            onChange={(event) => handleFiles(event.target.files)}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={status.kind === "working"}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition-opacity active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            <UploadSimple size={16} weight="bold" />
            {status.kind === "working" ? t("reading") : t("chooseFiles")}
          </button>
        </>
      )}
    </Dialog>
  );
}
