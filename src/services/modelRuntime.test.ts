jest.mock("expo-speech", () => ({
  VoiceQuality: {
    Default: "Default",
    Enhanced: "Enhanced",
  },
  getAvailableVoicesAsync: jest.fn(),
}));

import * as Speech from "expo-speech";

import { loadRuntimeModelMetadata, selectPreferredVoice } from "./modelRuntime";

const mockedGetAvailableVoicesAsync = Speech.getAvailableVoicesAsync as jest.MockedFunction<
  typeof Speech.getAvailableVoicesAsync
>;

describe("modelRuntime", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("prefers lower-latency English voices for speaker mode", () => {
    const selected = selectPreferredVoice(
      [
        {
          identifier: "en-network",
          name: "English Natural",
          quality: Speech.VoiceQuality.Enhanced,
          language: "en-US",
        },
        {
          identifier: "en-compact",
          name: "English Compact",
          quality: Speech.VoiceQuality.Default,
          language: "en-US",
        },
      ],
      "speaker",
    );

    expect(selected?.identifier).toBe("en-compact");
  });

  it("reports missing local vision and ready local tts metadata", async () => {
    mockedGetAvailableVoicesAsync.mockResolvedValue([
      {
        identifier: "en-enhanced",
        name: "English Natural",
        quality: Speech.VoiceQuality.Enhanced,
        language: "en-US",
      },
    ]);

    const metadata = await loadRuntimeModelMetadata({ geminiConfigured: false });

    expect(metadata.find((item) => item.id === "tts-android-system")?.status).toBe("ready");
    expect(metadata.find((item) => item.id === "gemini-fallback")?.status).toBe("disabled");
  });
});
