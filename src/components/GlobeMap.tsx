"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { geoContains, geoOrthographic, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { ArrowsOut } from "@phosphor-icons/react";
import type { CountryShape, WorldMapData } from "@/lib/geo";

const MIN_ZOOM = 0.85;
const MAX_ZOOM = 6;
/** Un tap con menos de este desplazamiento cuenta como click y no como giro. */
const DRAG_SLOP_PX = 6;
/** Cuántos grados gira el globo por píxel arrastrado, a zoom 1. */
const DEGREES_PER_PIXEL = 0.28;

interface GlobeMapProps {
  map: WorldMapData;
  visited: Record<string, true>;
  onToggle: (key: string) => void;
  onHover: (shape: CountryShape | null) => void;
}

/**
 * Globo girable, dibujado en canvas.
 *
 * Va en canvas y no en SVG a propósito: girar reproyecta las 236 geometrías en
 * cada frame, y hacerlo con nodos del DOM no aguanta. El precio es que no hay
 * elementos sobre los que hacer click, así que el país bajo el cursor se resuelve
 * invirtiendo la proyección y preguntando qué geometría contiene ese punto.
 */
export default function GlobeMap({ map, visited, onToggle, onHover }: GlobeMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Todo lo que cambia por frame vive en refs: pasarlo por estado re-renderizaría
  // React en cada píxel de arrastre.
  const rotation = useRef<[number, number]>([60, -15]);
  // Arranca apenas por debajo de 1 para que el globo no toque los bordes.
  const zoom = useRef(0.92);
  const dragging = useRef<{ x: number; y: number; moved: number } | null>(null);
  const size = useRef({ width: 0, height: 0 });
  const frame = useRef(0);

  const [ready, setReady] = useState(false);

  /** Proyección para el tamaño y la rotación actuales. */
  const projectionFor = useCallback(() => {
    const { width, height } = size.current;
    const radius = (Math.min(width, height) / 2 - 6) * zoom.current;
    return geoOrthographic()
      .translate([width / 2, height / 2])
      .scale(radius)
      .rotate([rotation.current[0], rotation.current[1]])
      .clipAngle(90);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const { width, height } = size.current;
    if (!canvas || !width || !height) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const styles = getComputedStyle(document.documentElement);
    const token = (name: string) => styles.getPropertyValue(name).trim();

    const projection = projectionFor();
    const path = geoPath(projection, context);

    context.clearRect(0, 0, width, height);

    // Océano: la esfera entera, que a la vez recorta el planeta.
    context.beginPath();
    path({ type: "Sphere" });
    context.fillStyle = token("--sea");
    context.fill();

    for (const shape of map.shapes) {
      context.beginPath();
      path(shape.feature as GeoPermissibleObjects);
      context.fillStyle = !shape.meta
        ? token("--land-inert")
        : visited[shape.key]
          ? token("--accent")
          : token("--land");
      context.fill();
      context.lineWidth = 0.4;
      context.strokeStyle = token("--sea");
      context.stroke();
    }
  }, [map, visited, projectionFor]);

  /** Agenda un dibujo para el próximo frame; varios eventos seguidos pintan una vez. */
  const scheduleDraw = useCallback(() => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      draw();
    });
  }, [draw]);

  // El canvas se dimensiona en píxeles físicos para que no se vea borroso.
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      size.current = { width: rect.width, height: rect.height };
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      canvas.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0);
      setReady(true);
      scheduleDraw();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [scheduleDraw]);

  useEffect(() => {
    if (ready) scheduleDraw();
  }, [ready, visited, map, scheduleDraw]);

  /** Qué país cae bajo un punto del canvas. */
  const shapeAt = useCallback(
    (clientX: number, clientY: number): CountryShape | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const point = projectionFor().invert?.([clientX - rect.left, clientY - rect.top]);
      if (!point) return null;

      for (const shape of map.shapes) {
        if (geoContains(shape.feature as GeoPermissibleObjects, point)) return shape;
      }
      return null;
    },
    [map, projectionFor],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = { x: event.clientX, y: event.clientY, moved: 0 };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragging.current;

    if (!drag) {
      const shape = shapeAt(event.clientX, event.clientY);
      onHover(shape?.meta ? shape : null);
      return;
    }

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    drag.x = event.clientX;
    drag.y = event.clientY;

    const speed = DEGREES_PER_PIXEL / zoom.current;
    rotation.current = [
      rotation.current[0] + dx * speed,
      // El eje vertical se topa antes de los polos: pasarse da vuelta el globo.
      Math.max(-85, Math.min(85, rotation.current[1] - dy * speed)),
    ];
    scheduleDraw();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragging.current;
    dragging.current = null;
    if (!drag || drag.moved > DRAG_SLOP_PX) return;

    const shape = shapeAt(event.clientX, event.clientY);
    if (shape?.meta) onToggle(shape.key);
  };

  const handleWheel = (event: React.WheelEvent) => {
    zoom.current = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, zoom.current * (event.deltaY < 0 ? 1.12 : 1 / 1.12)),
    );
    scheduleDraw();
  };

  const reset = () => {
    rotation.current = [60, -15];
    zoom.current = 0.92;
    scheduleDraw();
  };

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          dragging.current = null;
          onHover(null);
        }}
        onWheel={handleWheel}
        className="h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
        role="img"
        aria-label="Globo terráqueo. Arrastrá para girarlo y tocá un país para marcarlo."
      />

      <button
        type="button"
        onClick={reset}
        aria-label="Centrar el globo"
        title="Centrar el globo"
        className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full border border-ink-line bg-ink-raised/90 text-text-dim backdrop-blur transition-colors hover:border-accent hover:text-accent-ink active:scale-[0.94]"
      >
        <ArrowsOut size={18} weight="bold" />
      </button>
    </div>
  );
}
