import type { WorldMapData } from "./geo";
import type { TripStats } from "./stats";

export type CardFormat = "story" | "square";

// "9:16"/"1:1" no le dice nada a la mayoría: la gente reconoce la red social,
// no la relación de aspecto de su historia o su feed.
export const CARD_SIZES: Record<CardFormat, { width: number; height: number; label: string }> = {
  story: { width: 1080, height: 1920, label: "Instagram / Stories" },
  square: { width: 1080, height: 1080, label: "Twitter / Facebook" },
};

/** Dominio que va al pie de la tarjeta. Es el único canal de vuelta a la app. */
export const SHARE_URL = process.env.NEXT_PUBLIC_SHARE_URL ?? "dondeestuve.app";

/**
 * Lo que se imprime al pie: con cuenta, el link de referido personal, para que
 * quien vea la historia entre por ahí y quede conectado. Sin cuenta, el dominio
 * pelado.
 */
export function buildInviteLine(referralCode?: string | null) {
  return referralCode ? `${SHARE_URL}/?ref=${referralCode}` : SHARE_URL;
}

interface CardPalette {
  ink: string;
  sea: string;
  land: string;
  landInert: string;
  accent: string;
  text: string;
  textDim: string;
}

interface DrawOptions {
  canvas: HTMLCanvasElement;
  format: CardFormat;
  world: WorldMapData;
  visited: Record<string, true>;
  stats: TripStats;
  headline: string;
  /** Código de referido, si la persona tiene cuenta. */
  referralCode?: string | null;
  palette: CardPalette;
  fonts: { sans: string; mono: string };
}

/** Lee los tokens del tema activo para que la tarjeta salga igual que la pantalla. */
export function readPalette(): CardPalette {
  const style = getComputedStyle(document.documentElement);
  const token = (name: string) => style.getPropertyValue(name).trim();
  return {
    ink: token("--ink"),
    sea: token("--sea"),
    land: token("--land"),
    landInert: token("--land-inert"),
    accent: token("--accent"),
    text: token("--text"),
    textDim: token("--text-dim"),
  };
}

/**
 * next/font expone la familia real en estas variables. Canvas necesita el nombre
 * de familia, no la variable, así que hay que resolverlas antes de dibujar.
 */
export function readFonts() {
  const style = getComputedStyle(document.documentElement);
  return {
    sans: style.getPropertyValue("--font-geist-sans").trim() || "system-ui",
    mono: style.getPropertyValue("--font-geist-mono").trim() || "monospace",
  };
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

/** Parte el texto en líneas que entren en `maxWidth`. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function drawShareCard({
  canvas,
  format,
  world,
  visited,
  stats,
  headline,
  referralCode,
  palette,
  fonts,
}: DrawOptions) {
  const { width, height } = CARD_SIZES[format];
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const isStory = format === "story";
  const pad = 84;

  ctx.fillStyle = palette.ink;
  ctx.fillRect(0, 0, width, height);

  // --- Encabezado -----------------------------------------------------------
  const headerY = isStory ? 190 : 96;
  ctx.fillStyle = palette.textDim;
  ctx.font = `500 30px ${fonts.sans}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("DÓNDE ESTUVE", pad, headerY);

  // --- Mapa -----------------------------------------------------------------
  // Mantiene la relación de aspecto del mapa y se centra en su panel.
  const mapPanelY = headerY + 56;
  const mapPanelWidth = width - pad * 2;
  const mapPanelHeight = Math.round(mapPanelWidth * (world.height / world.width));

  ctx.save();
  roundedRect(ctx, pad, mapPanelY, mapPanelWidth, mapPanelHeight, 36);
  ctx.fillStyle = palette.sea;
  ctx.fill();
  ctx.clip();

  const scale = mapPanelWidth / world.width;
  ctx.translate(pad, mapPanelY);
  ctx.scale(scale, scale);
  ctx.lineWidth = 0.5 / scale;
  ctx.strokeStyle = palette.sea;

  for (const shape of world.shapes) {
    const path = new Path2D(shape.d);
    if (!shape.meta) {
      ctx.fillStyle = palette.landInert;
    } else {
      ctx.fillStyle = visited[shape.key] ? palette.accent : palette.land;
    }
    ctx.fill(path);
    ctx.stroke(path);
  }
  ctx.restore();

  // --- Número principal -----------------------------------------------------
  // El "de 195" quedaba afuera: para presumir importa cuántos países visitaste,
  // no cuántos le faltan. "países visitados" pegado al número dice lo mismo con
  // más gancho, y el achique automático evita que se salga de la tarjeta en el
  // cuadrado, donde hay bastante menos ancho que en la historia.
  let y = mapPanelY + mapPanelHeight + (isStory ? 190 : 130);

  ctx.textAlign = "left";
  ctx.fillStyle = palette.text;
  const bigSize = isStory ? 200 : 140;
  ctx.font = `600 ${bigSize}px ${fonts.mono}`;
  const bigText = String(stats.visited);
  ctx.fillText(bigText, pad, y);

  const bigWidth = ctx.measureText(bigText).width;
  const labelX = pad + bigWidth + 26;
  const labelMaxWidth = width - pad - labelX;
  let labelSize = Math.round(bigSize * 0.36);
  ctx.font = `600 ${labelSize}px ${fonts.sans}`;
  while (labelSize > 22 && ctx.measureText("países visitados").width > labelMaxWidth) {
    labelSize -= 2;
    ctx.font = `600 ${labelSize}px ${fonts.sans}`;
  }
  ctx.fillStyle = palette.accent;
  ctx.fillText("países visitados", labelX, y);

  y += isStory ? 66 : 52;
  ctx.fillStyle = palette.textDim;
  ctx.font = `400 ${isStory ? 42 : 33}px ${fonts.sans}`;
  ctx.fillText(
    `${stats.worldPercent.toLocaleString("es-AR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}% del mundo`,
    pad,
    y,
  );

  // --- Gancho ---------------------------------------------------------------
  if (headline) {
    y += isStory ? 108 : 84;
    ctx.fillStyle = palette.accent;
    const hookSize = isStory ? 58 : 45;
    ctx.font = `600 ${hookSize}px ${fonts.sans}`;
    for (const line of wrap(ctx, headline, width - pad * 2)) {
      ctx.fillText(line, pad, y);
      y += hookSize * 1.26;
    }
  }

  // --- Desglose por continente ---------------------------------------------
  // Solo en 9:16: es lo que llena la mitad de abajo, que si no queda vacía. En
  // el cuadrado no entra sin apretar todo.
  //
  // El gancho no siempre mide lo mismo: con un mensaje de una sola línea
  // "rowGap" fijo dejaba de sobra, pero con dos líneas (el caso más común) las
  // cinco filas de continentes llegaban a pisar el pie de página, literalmente
  // superpuesto con el link de vuelta a la app. El espacio entre filas ahora se
  // calcula con lo que quedó libre hasta el pie, así siempre entra completo.
  if (isStory) {
    y += 96;
    const footerTop = height - (isStory ? 90 : 68) - 40;
    const rowGap = Math.max(60, Math.min(92, (footerTop - y) / stats.continents.length));
    const barY = 26;

    for (const row of stats.continents) {
      ctx.fillStyle = palette.text;
      ctx.font = `500 40px ${fonts.sans}`;
      ctx.textAlign = "left";
      ctx.fillText(row.continent, pad, y);

      ctx.fillStyle = palette.textDim;
      ctx.font = `500 36px ${fonts.mono}`;
      ctx.textAlign = "right";
      ctx.fillText(`${row.visited}/${row.total}`, width - pad, y);

      ctx.fillStyle = palette.land;
      ctx.fillRect(pad, y + barY, width - pad * 2, 3);
      ctx.fillStyle = palette.accent;
      ctx.fillRect(pad, y + barY, ((width - pad * 2) * row.percent) / 100, 3);

      y += rowGap;
    }
    ctx.textAlign = "left";
  }

  // --- Pie ------------------------------------------------------------------
  // El link es el único camino de vuelta a la app desde una captura de pantalla.
  const footY = height - (isStory ? 90 : 68);
  const footSize = isStory ? 36 : 28;

  if (referralCode) {
    ctx.fillStyle = palette.accent;
    ctx.font = `600 ${footSize}px ${fonts.sans}`;
    ctx.textAlign = "left";
    // Pregunta y no orden: quien ve la historia ya está mirando un número, la
    // curiosidad de compararse invita más que un imperativo.
    const cta = "¿Vos cuántos llevás? ";
    ctx.fillText(cta, pad, footY);
    const ctaWidth = ctx.measureText(cta).width;
    ctx.fillStyle = palette.textDim;
    ctx.font = `500 ${footSize}px ${fonts.sans}`;
    ctx.fillText(buildInviteLine(referralCode), pad + ctaWidth, footY);
  } else {
    ctx.fillStyle = palette.textDim;
    ctx.font = `500 ${footSize}px ${fonts.sans}`;
    ctx.textAlign = "left";
    ctx.fillText(SHARE_URL, pad, footY);
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("No se pudo generar la imagen."));
    }, "image/png");
  });
}
