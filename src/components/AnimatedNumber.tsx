"use client";

import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  className?: string;
}

function format(value: number, decimals: number) {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Cuenta hasta el valor nuevo cuando el usuario marca un país. Es feedback de la
 * acción, así que se anima; el texto se escribe directo en el DOM para no
 * re-renderizar React en cada frame.
 */
export default function AnimatedNumber({ value, decimals = 0, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const from = previous.current;
    previous.current = value;

    if (reduce || from === value) {
      node.textContent = format(value, decimals);
      return;
    }

    const controls = animate(from, value, {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = format(latest, decimals);
      },
    });

    // Con la pestaña en segundo plano el navegador pausa los frames. El cleanup
    // deja siempre el valor exacto, se haya completado la animación o no.
    return () => {
      controls.stop();
      node.textContent = format(value, decimals);
    };
  }, [value, decimals, reduce]);

  return (
    <span ref={ref} className={className}>
      {format(value, decimals)}
    </span>
  );
}
