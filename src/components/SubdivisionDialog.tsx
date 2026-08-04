"use client";

import { memo, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { ArrowsOut, MagnifyingGlassMinus, MagnifyingGlassPlus } from "@phosphor-icons/react";
import Dialog from "./Dialog";
import AnimatedNumber from "./AnimatedNumber";
import { subdivisionKey, useTrip } from "@/lib/store";
import { track } from "@/lib/analytics";
import { getSubdivisionSet } from "@/data/subdivisions";
import {
  loadSubdivisionShapes,
  type SubdivisionMapData,
  type SubdivisionShape,
} from "@/lib/subdivisionGeo";
import { useMapZoom } from "@/lib/useMapZoom";

/** Mismo margen invisible que el mapa mundial: ver WorldMap.tsx. */
const HIT_BUFFER_PX = 11;

interface SubdivisionDialogProps {
  /** ISO alpha-2 del país, o null cuando el diálogo está cerrado. */
  countryCode: string | null;
  countryName: string;
  onClose: () => void;
}

export default function SubdivisionDialog({
  countryCode,
  countryName,
  onClose,
}: SubdivisionDialogProps) {
  const set = countryCode ? getSubdivisionSet(countryCode) : null;

  return (
    <Dialog
      open={Boolean(set)}
      onClose={onClose}
      title={set ? `${countryName}: ${set.label}` : ""}
    >
      {set && <SubdivisionBody countryCode={set.countryCode} />}
    </Dialog>
  );
}

function SubdivisionBody({ countryCode }: { countryCode: string }) {
  const locale = useLocale();
  const set = getSubdivisionSet(countryCode)!;
  const subdivisions = useTrip((state) => state.subdivisions);
  const toggleSubdivision = useTrip((state) => state.toggleSubdivision);

  const [map, setMap] = useState<SubdivisionMapData | null>(null);
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState<SubdivisionShape | null>(null);

  // Países con territorios lejos del continente (España con Canarias, Chile con
  // la Polinesia) quedan diminutos en el encuadre completo: sin zoom no se pueden
  // marcar las divisiones chicas.
  const { svgRef, groupRef, zoomBy, resetZoom } = useMapZoom({
    width: map?.width ?? 0,
    height: map?.height ?? 0,
    enabled: Boolean(map),
  });

  useEffect(() => {
    let active = true;
    loadSubdivisionShapes(set)
      .then((result) => {
        if (active) setMap(result);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [set]);

  const visitedCount = map
    ? Object.values(map.units).filter(
        (unit) => unit.countable && subdivisions[subdivisionKey(countryCode, unit.code)],
      ).length
    : 0;
  const percent = set.total ? (visitedCount / set.total) * 100 : 0;

  // d3 ya descarta el click de un arrastre real (clickDistance en useMapZoom),
  // así que acá no hace falta volver a medir nada.
  const handleToggle = (shape: SubdivisionShape) => {
    if (!shape.unit) return;
    const key = subdivisionKey(countryCode, shape.unit.code);
    const wasVisited = Boolean(subdivisions[key]);
    toggleSubdivision(countryCode, shape.unit.code);
    if (!wasVisited) track("subdivision_marked", { subdivision: shape.unit.code });
  };

  return (
    <>
      <div className="mb-4 flex items-baseline gap-2">
        <AnimatedNumber
          value={visitedCount}
          className="font-mono text-4xl leading-none font-semibold tracking-tighter tabular-nums"
        />
        <span className="text-lg leading-none font-semibold text-accent-ink">
          de <span className="font-mono tabular-nums">{set.total}</span>
        </span>
        <span className="ml-auto font-mono text-sm tabular-nums text-text-dim">
          {percent.toLocaleString(locale, { maximumFractionDigits: 0 })}%
        </span>
      </div>

      {failed ? (
        <p className="py-10 text-center text-sm text-text-dim">
          No pudimos cargar el mapa de {set.label}.
        </p>
      ) : !map ? (
        <div className="skeleton mx-auto h-[42vh] max-w-full rounded-[10px]" />
      ) : (
        <div className="relative">
          {/* El viewBox toma la forma real del país, así que el alto manda y el
              ancho sale solo: Argentina no queda perdida en un lienzo apaisado. */}
          <svg
            ref={svgRef}
            viewBox={`0 0 ${map.width} ${map.height}`}
            style={{ aspectRatio: `${map.width} / ${map.height}` }}
            className="mx-auto max-h-[46vh] w-auto max-w-full touch-none rounded-[10px] bg-sea select-none"
            onMouseLeave={() => setHovered(null)}
            role="group"
            aria-label={`Mapa de ${set.label}. Tocá uno para marcarlo.`}
          >
            <g ref={groupRef}>
              {map.shapes.map((shape) => (
                <UnitPath
                  key={shape.key}
                  shape={shape}
                  isVisited={Boolean(
                    shape.unit && subdivisions[subdivisionKey(countryCode, shape.unit.code)],
                  )}
                  onToggle={handleToggle}
                  onHover={setHovered}
                />
              ))}
            </g>
          </svg>

          <div className="absolute right-2 bottom-2 flex flex-col gap-2">
            <ZoomButton label="Acercar" onClick={() => zoomBy(1.7)}>
              <MagnifyingGlassPlus size={18} weight="bold" />
            </ZoomButton>
            <ZoomButton label="Alejar" onClick={() => zoomBy(1 / 1.7)}>
              <MagnifyingGlassMinus size={18} weight="bold" />
            </ZoomButton>
            <ZoomButton label="Ver el país entero" onClick={resetZoom}>
              <ArrowsOut size={18} weight="bold" />
            </ZoomButton>
          </div>

          {hovered?.unit && (
            <div
              role="status"
              aria-live="polite"
              className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 rounded-full border border-ink-line bg-ink-raised/95 px-3 py-1 text-[13px] backdrop-blur"
            >
              {hovered.unit.name}
            </div>
          )}
        </div>
      )}

      <p className="mt-4 text-[12px] leading-relaxed text-text-faint">
        {set.article} {set.label} no suman al total de 195 países: son su propio recuento.
      </p>
    </>
  );
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    // 44px: por debajo de eso un dedo real falla el botón con facilidad.
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-11 shrink-0 touch-manipulation place-items-center rounded-full border border-ink-line bg-ink-raised/90 text-text-dim backdrop-blur transition-colors hover:border-accent hover:text-accent-ink active:scale-[0.94]"
    >
      {children}
    </button>
  );
}

/**
 * Mismo patrón que WorldMap.tsx: un path invisible con margen de toque más
 * ancho hace de control interactivo, y uno visible puramente decorativo lo seguí
 * vía `peer`. Las provincias chicas (San Marino, un microestado, una isla) sufren
 * el problema todavía más que los países grandes.
 */
const UnitPath = memo(function UnitPath({
  shape,
  isVisited,
  onToggle,
  onHover,
}: {
  shape: SubdivisionShape;
  isVisited: boolean;
  onToggle: (shape: SubdivisionShape) => void;
  onHover: (shape: SubdivisionShape | null) => void;
}) {
  if (!shape.unit) {
    return <path d={shape.d} fill="var(--land-inert)" stroke="var(--sea)" strokeWidth={0.5} />;
  }

  return (
    <>
      <path
        d={shape.d}
        role="checkbox"
        aria-checked={isVisited}
        aria-label={shape.unit.name}
        tabIndex={0}
        fill="transparent"
        stroke="transparent"
        strokeWidth={HIT_BUFFER_PX}
        vectorEffect="non-scaling-stroke"
        pointerEvents="all"
        className="peer cursor-pointer outline-none"
        onClick={() => onToggle(shape)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle(shape);
          }
        }}
        onMouseEnter={() => onHover(shape)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(shape)}
        onBlur={() => onHover(null)}
      />
      <path
        d={shape.d}
        aria-hidden
        pointerEvents="none"
        fill={isVisited ? "var(--accent)" : "var(--land)"}
        stroke="var(--sea)"
        strokeWidth={0.6}
        vectorEffect="non-scaling-stroke"
        className="transition-[fill,filter] duration-150 peer-focus-visible:[stroke:var(--accent)] peer-focus-visible:[stroke-width:2] theme-light:peer-hover:brightness-90 theme-dark:peer-hover:brightness-125"
      />
    </>
  );
});
