import { buildCaptureSeed, selectSceneFixture, summarizeSceneSimilarity } from "./perception";

describe("perception helpers", () => {
  it("builds a deterministic seed", () => {
    const first = buildCaptureSeed({ base64: "abcdef", width: 100, height: 200 });
    const second = buildCaptureSeed({ base64: "abcdef", width: 100, height: 200 });
    expect(first).toBe(second);
  });

  it("uses the full frame payload instead of only the jpeg header prefix", () => {
    const sharedPrefix = "A".repeat(120);
    const first = buildCaptureSeed({ base64: `${sharedPrefix}BBBB`, width: 100, height: 200 });
    const second = buildCaptureSeed({ base64: `${sharedPrefix}CCCC`, width: 100, height: 200 });
    expect(first).not.toBe(second);
  });

  it("selects a fixture from a seed", () => {
    const fixture = selectSceneFixture(2);
    expect(fixture.summary.length).toBeGreaterThan(0);
  });

  it("detects unchanged summaries", () => {
    expect(summarizeSceneSimilarity("Same", "same")).toBe(true);
  });
});
