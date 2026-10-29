/**
 * Shrinks a photo in the browser before it is uploaded.
 * A 6 MB phone screenshot becomes ~250–400 KB while menu text stays
 * sharp — this is the single biggest speed win for uploads.
 */
const MAX_LONG_SIDE = 2400;
const MAX_SHORT_SIDE = 1400;
const QUALITY = 0.85;

export async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const long = Math.max(bitmap.width, bitmap.height);
  const short = Math.min(bitmap.width, bitmap.height);
  const scale = Math.min(1, MAX_LONG_SIDE / long, MAX_SHORT_SIDE / short);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare image.");
  ctx.fillStyle = "#ffffff"; // flatten transparent PNGs
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", QUALITY);
}

export const MAX_INPUT_BYTES = 25 * 1024 * 1024;
