import { demoScenes } from "../data/demoScenes";
import { DemoSceneFixture } from "../types/app";

export function buildCaptureSeed(input: { base64: string; width?: number; height?: number }) {
  let hash = 0;
  const source = input.base64;

  if (!source.length) {
    return (input.width || 0) * 13 + (input.height || 0) * 7;
  }

  const step = Math.max(1, Math.floor(source.length / 64));

  for (let index = 0; index < source.length; index += step) {
    hash = (hash * 33 + source.charCodeAt(index)) >>> 0;
  }

  return hash + (input.width || 0) * 13 + (input.height || 0) * 7;
}

export function selectSceneFixture(seed: number): DemoSceneFixture {
  return demoScenes[Math.abs(seed) % demoScenes.length] || demoScenes[0];
}

export function summarizeSceneSimilarity(previousSummary: string | null, nextSummary: string) {
  if (!previousSummary) {
    return false;
  }

  return previousSummary.trim().toLowerCase() === nextSummary.trim().toLowerCase();
}
