"use client";

import { useCallback, useEffect, useRef } from "react";
import { select } from "d3-selection";
import { zoom as d3Zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import "d3-transition";

export const MIN_SCALE = 1;
export const MAX_SCALE = 14;
/** Un tap con menos de este desplazamiento cuenta como click y no como arrastre. */
export const DRAG_SLOP_PX = 6;

interface Options {
  /** Medidas del viewBox. El zoom trabaja en esas unidades, no en píxeles. */
  width: number;
  height: number;
  /** Se pasa a false mientras la geometría todavía no está lista. */
  enabled?: boolean;
}

/**
 * Zoom y paneo para un SVG con viewBox. El transform se escribe directo en el
 * `<g>`: meterlo en el estado de React re-renderizaría todos los paths por frame.
 */

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

export function useMapZoom({ width, height, enabled = true }: Options) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const behaviourRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const group = groupRef.current;
    if (!svg || !group || !enabled) return;

    // d3-zoom lee las coordenadas del puntero en el espacio del viewBox, así que
    // el extent va en esas mismas unidades y no en píxeles del elemento; si no,
    // el paneo se corta antes de tiempo.
    const box: [[number, number], [number, number]] = [
      [0, 0],
      [width, height],
    ];

    const behaviour = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_SCALE, MAX_SCALE])
      .extent(box)
      .translateExtent(box)
      .on("zoom", (event: { transform: ZoomTransform }) => {
        group.setAttribute("transform", event.transform.toString());
      });

    behaviourRef.current = behaviour;
    const selection = select(svg);
    selection.call(behaviour).on("dblclick.zoom", null);

    return () => {
      selection.on(".zoom", null);
      behaviourRef.current = null;
    };
  }, [width, height, enabled]);

  const zoomBy = useCallback((factor: number) => {
    const svg = svgRef.current;
    const behaviour = behaviourRef.current;
    if (!svg || !behaviour) return;
    behaviour.scaleBy(zoomTarget(svg, 260), factor);
  }, []);

  const resetZoom = useCallback(() => {
    const svg = svgRef.current;
    const behaviour = behaviourRef.current;
    if (!svg || !behaviour) return;
    behaviour.transform(zoomTarget(svg, 320), zoomIdentity);
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  }, []);

  /** true si el gesto fue un tap y no un arrastre del mapa. */
  const wasTap = useCallback((event: { clientX: number; clientY: number }) => {
    const start = pointerStart.current;
    if (!start) return true;
    return Math.hypot(event.clientX - start.x, event.clientY - start.y) <= DRAG_SLOP_PX;
  }, []);

  return { svgRef, groupRef, zoomBy, resetZoom, handlePointerDown, wasTap };
}
