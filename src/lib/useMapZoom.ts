"use client";

import { useCallback, useEffect, useRef } from "react";
import { select } from "d3-selection";
import { zoom as d3Zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import "d3-transition";

export const MIN_SCALE = 1;
export const MAX_SCALE = 14;
/**
 * Cuánto puede moverse el puntero entre el down y el up para que d3 lo siga
 * considerando un click. Por defecto d3-zoom trae esto en 0: cualquier temblor
 * de mano durante un click hace que lo tome como un arrastre y lo descarte
 * antes de que llegue a React. Con este margen, un click sigue siendo un click.
 */
export const CLICK_DISTANCE = 8;

interface Options {
  /** Medidas del viewBox. El zoom trabaja en esas unidades, no en píxeles. */
  width: number;
  height: number;
  /** Se pasa a false mientras la geometría todavía no está lista. */
  enabled?: boolean;
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

/**
 * Zoom y paneo para un SVG con viewBox. El transform se escribe directo en el
 * `<g>`: meterlo en el estado de React re-renderizaría todos los paths por frame.
 */
export function useMapZoom({ width, height, enabled = true }: Options) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const behaviourRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

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
      .clickDistance(CLICK_DISTANCE)
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

  return { svgRef, groupRef, zoomBy, resetZoom };
}
