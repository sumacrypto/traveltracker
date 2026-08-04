"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { select } from "d3-selection";
import { zoom as d3Zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import "d3-transition";
import { MagnifyingGlassPlus, MagnifyingGlassMinus, ArrowsOut, Globe, MapTrifold } from "@phosphor-icons/react";
import GlobeMap from "./GlobeMap";
import { type CountryShape } from "@/lib/geo";
import { useWorldShapes } from "@/lib/worldShapes";

const MIN_SCALE = 1;
const MAX_SCALE = 14;
/**
 * Cuánto puede moverse el puntero entre el down y el up para que d3 lo siga
 * considerando un click y no un arrastre.
 *
 * d3-zoom trae esto en 0 por defecto: literalmente cualquier temblor de mano
 * durante un click (imposible de evitar, ni apoyando el mouse con cuidado) hace
 * que d3 lo tome como el inicio de un arrastre y descarte el click entero antes
 * de que llegue a React. Es el motivo real de que marcar países se sienta
 * pegajoso. Con este margen, un click sigue siendo un click aunque el puntero se
 * corra unos pocos píxeles.
 */
const CLICK_DISTANCE = 8;
/**
 * Margen invisible alrededor de cada país, en píxeles de pantalla (constante en
 * cualquier zoom gracias a `vectorEffect="non-scaling-stroke"`). Sin esto, tocar
 * un país es tocar exactamente su costa: países chicos como Luxemburgo o las
 * islas del Caribe terminan siendo casi imposibles de marcar, sobre todo con el
 * dedo. Es el mismo truco que usa cualquier mapa táctil serio.
 */
const HIT_BUFFER_PX = 11;

/**
 * Qué quiere destacar la interfaz. El nonce permite repetir el mismo objetivo
 * dos veces seguidas y que igual se dispare.
 */
export type MapFocus =
  /** País marcado desde el buscador: se confirma con el chip, sin mover la vista. */
  | { kind: "country"; key: string; nonce: number }
  /** Continente elegido en la lista: el mapa lo encuadra. */
  | { kind: "continent"; continent: string; nonce: number };

/** Cuánto queda visible el chip de confirmación tras marcar desde el buscador. */
const FOCUS_FLASH_MS = 1800;

export type MapView = "flat" | "globe";

interface WorldMapProps {
  visited: Record<string, true>;
  onToggle: (key: string) => void;
  focus: MapFocus | null;
  view: MapView;
  onViewChange: (view: MapView) => void;
}


/**
 * Con la pestaña oculta el navegador congela los frames y una transición de d3
 * queda a mitad de camino. En ese caso se aplica el transform de una.
 */
function zoomTarget(svg: SVGSVGElement, duration: number) {
  const selection = select(svg);
  return typeof document !== "undefined" && document.hidden
    ? selection
    : selection.transition().duration(duration);
}

export default function WorldMap({ visited, onToggle, focus, view, onViewChange }: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const { map, error } = useWorldShapes();
  const shapes = map?.shapes ?? null;
  /** País bajo el cursor. Alimenta el tooltip que lo sigue. */
  const [hovered, setHovered] = useState<CountryShape | null>(null);
  /** País con foco de teclado. Alimenta el chip centrado. */
  const [focused, setFocused] = useState<CountryShape | null>(null);
  /** Nonce del último aviso del buscador que ya se ocultó. */
  const [expiredFlash, setExpiredFlash] = useState<number | null>(null);

  // Zoom y paneo van por fuera del ciclo de render de React: el transform se
  // escribe directo en el <g> para no re-renderizar 230 paths por frame.
  useEffect(() => {
    const svg = svgRef.current;
    const g = gRef.current;
    if (!svg || !g || !map) return;

    // d3-zoom lee las coordenadas del puntero en el espacio del viewBox, así que
    // el extent tiene que declararse en esas mismas unidades y no en píxeles del
    // elemento; si no, el paneo se corta antes de tiempo cuando hay zoom.
    const viewBox: [[number, number], [number, number]] = [
      [0, 0],
      [map.width, map.height],
    ];

    const behaviour = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_SCALE, MAX_SCALE])
      .extent(viewBox)
      .translateExtent(viewBox)
      .clickDistance(CLICK_DISTANCE)
      .on("zoom", (event: { transform: ZoomTransform }) => {
        g.setAttribute("transform", event.transform.toString());
      });

    zoomRef.current = behaviour;
    const selection = select(svg);
    selection.call(behaviour).on("dblclick.zoom", null);

    return () => {
      selection.on(".zoom", null);
      zoomRef.current = null;
    };
  }, [map]);

  const zoomBy = useCallback((factor: number) => {
    const svg = svgRef.current;
    const behaviour = zoomRef.current;
    if (!svg || !behaviour) return;
    behaviour.scaleBy(zoomTarget(svg, 260), factor);
  }, []);

  const resetZoom = useCallback(() => {
    const svg = svgRef.current;
    const behaviour = zoomRef.current;
    if (!svg || !behaviour) return;
    behaviour.transform(zoomTarget(svg, 320), zoomIdentity);
    setHovered(null);
  }, []);

  // Al marcar desde el buscador el país puede quedar fuera de la vista o ser
  // diminuto, así que se confirma con el chip. A propósito no se hace zoom: rompe
  // el flujo de marcar varios países seguidos escribiendo.
  useEffect(() => {
    if (focus?.kind !== "country") return;
    const timer = setTimeout(() => setExpiredFlash(focus.nonce), FOCUS_FLASH_MS);
    return () => clearTimeout(timer);
  }, [focus]);

  // Elegir un continente sí mueve la vista: es una acción de navegación.
  useEffect(() => {
    const svg = svgRef.current;
    const behaviour = zoomRef.current;
    if (focus?.kind !== "continent" || !svg || !behaviour || !map) return;

    const bounds = map.continentBounds[focus.continent];
    if (!bounds) return;

    const [[x0, y0], [x1, y1]] = bounds;
    const width = Math.max(x1 - x0, 1);
    const height = Math.max(y1 - y0, 1);
    // 0,85 deja un respiro alrededor en vez de pegar el continente a los bordes.
    const scale = Math.min(MAX_SCALE, 0.85 * Math.min(map.width / width, map.height / height));

    behaviour.transform(
      zoomTarget(svg, 520),
      zoomIdentity
        .translate(map.width / 2, map.height / 2)
        .scale(Math.max(MIN_SCALE, scale))
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
    );
  }, [focus, map]);

  const flashed =
    focus?.kind === "country" && focus.nonce !== expiredFlash
      ? (shapes?.find((s) => s.key === focus.key) ?? null)
      : null;
  // El chip centrado queda para teclado y buscador; el mouse usa el tooltip.
  const spotlighted = focused ?? flashed;

  // La posición del tooltip se escribe directo en el DOM: en un mousemove no
  // puede pasar por el estado de React.
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const tooltip = tooltipRef.current;
    const container = containerRef.current;
    if (!tooltip || !container) return;

    const bounds = container.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    // Cerca del borde derecho o de arriba, el tooltip se corre al otro lado del
    // cursor para no quedar cortado.
    const flipX = x + tooltip.offsetWidth + 22 > bounds.width;
    const flipY = y - tooltip.offsetHeight - 14 < 0;

    tooltip.style.transform = `translate(${
      flipX ? x - tooltip.offsetWidth - 14 : x + 14
    }px, ${flipY ? y + 18 : y - tooltip.offsetHeight - 10}px)`;
  }, []);

  // d3 ya se encarga de no dejar pasar el click de un arrastre real (ver
  // CLICK_DISTANCE arriba), así que acá no hace falta volver a medir nada: si
  // esto se ejecuta, es porque fue un tap.
  const handleToggleShape = useCallback(
    (shape: CountryShape) => onToggle(shape.key),
    [onToggle],
  );

  const paths = useMemo(() => {
    if (!shapes) return null;
    return shapes.map((shape) => (
      <CountryPath
        key={shape.key}
        shape={shape}
        isVisited={Boolean(visited[shape.key])}
        onToggle={handleToggleShape}
        onHover={setHovered}
        onFocusChange={setFocused}
      />
    ));
  }, [shapes, visited, handleToggleShape]);

  if (error) {
    return (
      <div className="flex h-full min-h-70 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-text-dim">No pudimos cargar el mapa.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full border border-ink-line px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent-ink"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!map) {
    return (
      <div className="h-full min-h-70 w-full p-2" aria-busy="true" aria-label="Cargando el mapa">
        <div className="skeleton h-full w-full rounded-[14px]" />
      </div>
    );
  }

  return (
    // El océano va dentro del SVG y no en el contenedor: el mapa es 2,3:1 y el
    // panel casi cuadrado, así que si el mar ocupara todo quedaría medio panel de
    // agua vacía. Pintado solo detrás del mapa, el aire alrededor se lee como
    // margen y la pieza queda centrada.
    <div ref={containerRef} className="relative h-full w-full">
      {view === "globe" ? (
        <GlobeMap map={map} visited={visited} onToggle={onToggle} onHover={setHovered} />
      ) : (
      <svg
        ref={svgRef}
        viewBox={`0 0 ${map.width} ${map.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full touch-none select-none"
        onMouseMove={handleMouseMove}
        onPointerLeave={() => setHovered(null)}
        role="group"
        aria-label="Mapa mundial. Tocá un país para marcarlo como visitado."
      >
        <rect
          width={map.width}
          height={map.height}
          rx={10}
          fill="var(--sea)"
        />
        <g ref={gRef}>{paths}</g>
      </svg>
      )}

      <CountryTooltip
        ref={tooltipRef}
        shape={hovered}
        isVisited={hovered ? Boolean(visited[hovered.key]) : false}
      />

      <MapLegend
        shape={spotlighted}
        isVisited={spotlighted ? Boolean(visited[spotlighted.key]) : false}
      />

      <div className="absolute top-3 left-3">
        <MapButton
          label={view === "globe" ? "Ver el planisferio" : "Ver el globo"}
          onClick={() => onViewChange(view === "globe" ? "flat" : "globe")}
        >
          {view === "globe" ? (
            <MapTrifold size={20} weight="bold" />
          ) : (
            <Globe size={20} weight="bold" />
          )}
        </MapButton>
      </div>

      {view === "flat" && (
        <div className="absolute right-3 bottom-3 flex flex-col gap-2">
          <MapButton label="Acercar" onClick={() => zoomBy(1.7)}>
            <MagnifyingGlassPlus size={20} weight="bold" />
          </MapButton>
          <MapButton label="Alejar" onClick={() => zoomBy(1 / 1.7)}>
            <MagnifyingGlassMinus size={20} weight="bold" />
          </MapButton>
          <MapButton label="Ver todo el mapa" onClick={resetZoom}>
            <ArrowsOut size={20} weight="bold" />
          </MapButton>
        </div>
      )}
    </div>
  );
}

function MapButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    // 44px y no los 36px de antes: por debajo del mínimo que recomiendan Apple
    // y Google para un blanco táctil, un dedo real pasa cerca del botón sin
    // acertarle. Eso explica buena parte de "los botones no funcionan" en mobile.
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
 * Sigue al cursor mostrando el país que está debajo. Solo se dibuja donde hay un
 * puntero de verdad: en touch taparía el dedo, y ahí ya está el chip centrado.
 */
function CountryTooltip({
  ref,
  shape,
  isVisited,
}: {
  ref: React.Ref<HTMLDivElement>;
  shape: CountryShape | null;
  isVisited: boolean;
}) {
  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute top-0 left-0 z-10 hidden items-center gap-2 rounded-full border border-ink-line bg-ink-raised/95 px-3 py-1.5 text-sm whitespace-nowrap backdrop-blur ${
        shape?.meta ? "pointer-fine:flex" : ""
      }`}
    >
      {shape?.meta ? (
        <>
          <span>{shape.meta.flag}</span>
          <span className="font-medium">{shape.meta.name}</span>
          <span className={isVisited ? "text-accent-ink" : "text-text-faint"}>
            {isVisited ? "visitado" : "sin marcar"}
          </span>
        </>
      ) : null}
    </div>
  );
}

/** Chip fijo arriba del mapa, para teclado y para el aviso del buscador. */
function MapLegend({ shape, isVisited }: { shape: CountryShape | null; isVisited: boolean }) {
  if (!shape?.meta) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute top-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-ink-line bg-ink-raised/95 px-3 py-1.5 text-sm backdrop-blur"
    >
      <span aria-hidden>{shape.meta.flag}</span>
      <span className="font-medium">{shape.meta.name}</span>
      <span className={isVisited ? "text-accent-ink" : "text-text-faint"}>
        {isVisited ? "visitado" : "sin marcar"}
      </span>
    </div>
  );
}

interface CountryPathProps {
  shape: CountryShape;
  isVisited: boolean;
  onToggle: (shape: CountryShape) => void;
  onHover: (shape: CountryShape | null) => void;
  onFocusChange: (shape: CountryShape | null) => void;
}

/**
 * Cada país countable se dibuja con DOS paths superpuestos, misma `d`:
 *
 *  1. Uno invisible, con un stroke ancho (`HIT_BUFFER_PX`) y
 *     `pointerEvents="all"`: es el que de verdad recibe el click y el foco, y
 *     su área tocable se extiende más allá de la costa real.
 *  2. Uno visible, `pointerEvents="none"`, puramente decorativo.
 *
 * Sin esto, tocar un país es tocar exactamente su silueta: para Luxemburgo o
 * una isla del Caribe en el mapa completo, eso son un puñado de píxeles. El
 * hover y el foco del path visible siguen al invisible vía `peer`.
 */
const CountryPath = memo(function CountryPath({
  shape,
  isVisited,
  onToggle,
  onHover,
  onFocusChange,
}: CountryPathProps) {
  // Territorios sin código ISO (Somalilandia, Chipre del Norte, glaciares en
  // disputa): se dibujan como tierra pero no se pueden marcar.
  if (!shape.meta) {
    return <path d={shape.d} fill="var(--land-inert)" stroke="var(--sea)" strokeWidth={0.3} />;
  }

  const activate = () => onToggle(shape);

  return (
    <>
      <path
        d={shape.d}
        role="checkbox"
        aria-checked={isVisited}
        aria-label={shape.meta.name}
        tabIndex={0}
        fill="transparent"
        stroke="transparent"
        strokeWidth={HIT_BUFFER_PX}
        vectorEffect="non-scaling-stroke"
        pointerEvents="all"
        className="peer cursor-pointer outline-none"
        onClick={activate}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activate();
          }
        }}
        onMouseEnter={() => onHover(shape)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onFocusChange(shape)}
        onBlur={() => onFocusChange(null)}
      />
      <path
        d={shape.d}
        aria-hidden
        pointerEvents="none"
        fill={isVisited ? "var(--accent)" : "var(--land)"}
        stroke="var(--sea)"
        strokeWidth={0.4}
        vectorEffect="non-scaling-stroke"
        // Dos detalles acá:
        // - el hover aclara en oscuro y oscurece en claro; aclarar sobre el gris
        //   claro llevaría al país casi a blanco y perdería el borde con el mar.
        // - el foco se marca con el contorno del propio país: un outline
        //   rodearía el bounding box, que en Estados Unidos o Rusia cruza medio
        //   mapa.
        className="transition-[fill,filter] duration-150 peer-focus-visible:[stroke:var(--accent)] peer-focus-visible:[stroke-width:2] theme-light:peer-hover:brightness-90 theme-dark:peer-hover:brightness-125"
      />
    </>
  );
});
