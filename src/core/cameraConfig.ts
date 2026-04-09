const CAPTURE_SIZE_PATTERN = /^(\d+)x(\d+)$/;

export const TARGET_CAPTURE_WIDTH = 1920;
export const TARGET_CAPTURE_HEIGHT = 1080;
export const CAPTURE_INTERVAL_MS = 250;

type ParsedCaptureSize = {
  raw: string;
  width: number;
  height: number;
  score: number;
};

function parseCaptureSize(size: string): ParsedCaptureSize | null {
  const match = CAPTURE_SIZE_PATTERN.exec(size.trim());
  if (!match) {
    return null;
  }

  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  const longEdge = Math.max(width, height);
  const shortEdge = Math.min(width, height);
  const targetLongEdge = Math.max(TARGET_CAPTURE_WIDTH, TARGET_CAPTURE_HEIGHT);
  const targetShortEdge = Math.min(TARGET_CAPTURE_WIDTH, TARGET_CAPTURE_HEIGHT);
  const aspectRatioPenalty = Math.abs(longEdge / shortEdge - targetLongEdge / targetShortEdge);
  const edgePenalty = Math.abs(longEdge - targetLongEdge) + Math.abs(shortEdge - targetShortEdge);

  return {
    raw: size,
    width,
    height,
    score: aspectRatioPenalty * 10000 + edgePenalty,
  };
}

export function chooseCapturePictureSize(sizes: string[]): string | null {
  const parsed = sizes
    .map(parseCaptureSize)
    .filter((value): value is ParsedCaptureSize => value != null)
    .sort((left, right) => left.score - right.score);

  if (!parsed.length) {
    return null;
  }

  return parsed[0].raw;
}
