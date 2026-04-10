const mockDownloadFileAsync = jest.fn();
const mockResolveAssetSource = jest.fn();

jest.mock("react-native-fast-tflite", () => ({
  loadTensorflowModel: jest.fn(),
}));

jest.mock("expo-image-manipulator", () => ({
  SaveFormat: {
    JPEG: "jpeg",
  },
  manipulateAsync: jest.fn(async (_uri: string, _actions: unknown[], _options: unknown) => ({
    uri: "file:///resized-frame.jpg",
    width: 300,
    height: 300,
    base64: "RESIZED_FRAME_BASE64",
  })),
}));

jest.mock("../lib/tfliteDetection", () => ({
  DEFAULT_DETECTION_THRESHOLD: 0.45,
  buildDetectionResultSummary: jest.fn(() => "Chair ahead."),
  parseTfliteObjectDetectionOutputs: jest.fn(() => ({
    objects: [
      {
        id: "chair-0",
        label: "Chair",
        icon: "chair",
        confidence: 0.91,
        positionLabel: "ahead",
        distanceEstimateMeters: 1.2,
        priority: "high",
      },
    ],
    summary: "Chair ahead.",
    lowLight: false,
  })),
  preprocessJpegBase64ForTflite: jest.fn(() => ({
    input: new Uint8Array(300 * 300 * 3),
    averageLuma: 120,
  })),
}));

import { loadTensorflowModel } from "react-native-fast-tflite";
import { manipulateAsync } from "expo-image-manipulator";
import { File } from "expo-file-system";
import { Image, Platform } from "react-native";

import { normalizeFileUri, PerceptionService } from "./perceptionService";
import { AppSettings } from "../types/app";

const mockedLoadTensorflowModel = loadTensorflowModel as jest.MockedFunction<
  typeof loadTensorflowModel
>;
const mockedManipulateAsync = manipulateAsync as jest.MockedFunction<typeof manipulateAsync>;

const settings: AppSettings = {
  speechRate: 1,
  verbosity: "standard",
  audioOutputMode: "speaker",
  vibrationEnabled: true,
  lowLightAlertsEnabled: true,
  geminiFallbackEnabled: false,
  confirmActions: true,
  debugMode: true,
};

describe("PerceptionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(File, { downloadFileAsync: mockDownloadFileAsync });
    Object.assign(Image, { resolveAssetSource: mockResolveAssetSource });
    Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });
    mockResolveAssetSource.mockReturnValue({
      uri: "http://localhost:8081/assets/assets/models/yolo26s_float16.tflite",
    });
    mockDownloadFileAsync.mockImplementation(async (_url: string, destination: { uri: string }) => destination);
  });

  it("loads the bundled tflite model with android gpu first", async () => {
    mockedLoadTensorflowModel.mockResolvedValue({
      delegate: "android-gpu",
      inputs: [{ name: "input", dataType: "uint8", shape: [1, 300, 300, 3] }],
      outputs: [
        { name: "boxes", dataType: "float32", shape: [1, 10, 4] },
        { name: "classes", dataType: "float32", shape: [1, 10] },
        { name: "scores", dataType: "float32", shape: [1, 10] },
        { name: "count", dataType: "float32", shape: [1] },
      ],
      run: jest.fn(),
      runSync: jest.fn(),
    });

    const service = new PerceptionService();
    const metadata = await service.initialize();

    expect(mockDownloadFileAsync).toHaveBeenCalledWith(
      "http://127.0.0.1:8081/assets/assets/models/yolo26s_float16.tflite",
      expect.objectContaining({ uri: expect.stringMatching(/yolo26s_float16\.tflite$/) }),
      { idempotent: true },
    );
    expect(mockedLoadTensorflowModel).toHaveBeenCalledWith(
      { url: expect.stringMatching(/yolo26s_float16\.tflite$/) },
      "android-gpu",
    );
    expect(metadata.status).toBe("ready");
    expect(service.isReady()).toBe(true);
  });

  it("falls back from android gpu to nnapi and then default", async () => {
    mockedLoadTensorflowModel
      .mockRejectedValueOnce(new Error("GPU unavailable"))
      .mockRejectedValueOnce(new Error("NNAPI unavailable"))
      .mockResolvedValueOnce({
        delegate: "default",
        inputs: [{ name: "input", dataType: "uint8", shape: [1, 300, 300, 3] }],
        outputs: [],
        run: jest.fn(),
        runSync: jest.fn(() => []),
      });

    const service = new PerceptionService();
    const metadata = await service.initialize();

    expect(mockedLoadTensorflowModel).toHaveBeenNthCalledWith(
      1,
      { url: expect.stringMatching(/yolo26s_float16\.tflite$/) },
      "android-gpu",
    );
    expect(mockedLoadTensorflowModel).toHaveBeenNthCalledWith(
      2,
      { url: expect.stringMatching(/yolo26s_float16\.tflite$/) },
      "nnapi",
    );
    expect(mockedLoadTensorflowModel).toHaveBeenNthCalledWith(
      3,
      { url: expect.stringMatching(/yolo26s_float16\.tflite$/) },
      "default",
    );
    expect(metadata.status).toBe("ready");
  });

  it("runs local tflite inference when the model is loaded", async () => {
    const run = jest.fn(async () => [
      new Float32Array([0.1, 0.1, 0.5, 0.5]),
      new Float32Array([62]),
      new Float32Array([0.91]),
      new Float32Array([1]),
    ]);

    mockedLoadTensorflowModel.mockResolvedValue({
      delegate: "default",
      inputs: [{ name: "input", dataType: "uint8", shape: [1, 300, 300, 3] }],
      outputs: [],
      run,
      runSync: jest.fn(),
    });

    const service = new PerceptionService();
    await service.initialize();
    const prepared = await service.preparePictureForAnalysis({
      uri: "file:///frame.jpg",
      width: 640,
      height: 480,
    });
    const result = await service.analyze(
      {
        base64: prepared.base64,
        uri: prepared.uri,
        width: prepared.width,
        height: prepared.height,
        capturedAt: 123456,
      },
      settings,
    );

    expect(mockedManipulateAsync).toHaveBeenCalled();
    expect(run).toHaveBeenCalled();
    expect(result.backend).toBe("local-tflite");
    expect(result.capturedAt).toBe(123456);
    expect(result.objects[0]?.label).toBe("Chair");
  });

  it("normalizes raw snapshot paths into file URIs", () => {
    expect(normalizeFileUri("/data/user/0/com.anonymous.visionedge/cache/frame.jpg")).toBe(
      "file:///data/user/0/com.anonymous.visionedge/cache/frame.jpg",
    );
    expect(normalizeFileUri("file:///data/user/0/com.anonymous.visionedge/cache/frame.jpg")).toBe(
      "file:///data/user/0/com.anonymous.visionedge/cache/frame.jpg",
    );
  });
});
