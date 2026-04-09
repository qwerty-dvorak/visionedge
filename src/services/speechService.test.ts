jest.mock("expo-speech", () => ({
  VoiceQuality: {
    Default: "Default",
    Enhanced: "Enhanced",
  },
  getAvailableVoicesAsync: jest.fn(),
  speak: jest.fn(),
  stop: jest.fn().mockResolvedValue(undefined),
}));

import * as Speech from "expo-speech";

import { createSpeechService } from "./speechService";

const mockedGetAvailableVoicesAsync = Speech.getAvailableVoicesAsync as jest.MockedFunction<
  typeof Speech.getAvailableVoicesAsync
>;
const mockedSpeak = Speech.speak as jest.MockedFunction<typeof Speech.speak>;

describe("speechService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes voices and uses the selected voice for queued speech", async () => {
    mockedGetAvailableVoicesAsync.mockResolvedValue([
      {
        identifier: "en-compact",
        name: "English Compact",
        quality: Speech.VoiceQuality.Default,
        language: "en-US",
      },
    ]);
    mockedSpeak.mockImplementation((_text, options) => {
      options?.onDone?.();
    });

    const service = createSpeechService();

    await service.initialize();
    await service.enqueue("Settings opened.", { audioOutputMode: "speaker", rate: 1 });

    expect(mockedSpeak).toHaveBeenCalledWith(
      "Settings opened.",
      expect.objectContaining({
        rate: 1,
        voice: "en-compact",
      }),
    );
  });
});
