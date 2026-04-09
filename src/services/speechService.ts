import * as Speech from "expo-speech";

import { AudioOutputMode } from "../types/app";
import { selectPreferredVoice } from "./modelRuntime";

type SpeechLogger = (level: "info" | "warning" | "error", message: string) => void;

type SpeechRequestOptions = Speech.SpeechOptions & {
  audioOutputMode?: AudioOutputMode;
  interrupt?: boolean;
  replaceQueue?: boolean;
};

type SpeechJob = {
  text: string;
  options?: SpeechRequestOptions;
  resolve: () => void;
  reject: (error: Error) => void;
};

function logSpeechEvent(
  logger: SpeechLogger | undefined,
  level: "info" | "warning" | "error",
  message: string,
) {
  const formatted = `[VisionEdge][speech] ${message}`;
  if (level === "error") {
    console.error(formatted);
  } else if (level === "warning") {
    console.warn(formatted);
  } else {
    console.info(formatted);
  }

  logger?.(level, message);
}

export function createSpeechService(logger?: SpeechLogger) {
  const queue: SpeechJob[] = [];
  let speaking = false;
  let lastSpokenText = "";
  let availableVoices: Speech.Voice[] = [];

  async function initialize() {
    try {
      availableVoices = await Speech.getAvailableVoicesAsync();
      logSpeechEvent(
        logger,
        availableVoices.length ? "info" : "warning",
        availableVoices.length
          ? `Speech engine initialized with ${availableVoices.length} available voice(s).`
          : "Speech engine initialized but no voices were reported.",
      );
    } catch (error: unknown) {
      availableVoices = [];
      logSpeechEvent(
        logger,
        "error",
        error instanceof Error ? error.message : "Failed to initialize the speech engine.",
      );
      throw error;
    }
  }

  function resolveSpeechOptions(options?: SpeechRequestOptions): Speech.SpeechOptions {
    const audioOutputMode = options?.audioOutputMode || "speaker";
    const preferredVoice = selectPreferredVoice(availableVoices, audioOutputMode);

    return {
      rate: options?.rate ?? 1,
      pitch: options?.pitch ?? 1,
      language: options?.language || preferredVoice?.language,
      voice: options?.voice || preferredVoice?.identifier,
      onBoundary: options?.onBoundary,
      onDone: options?.onDone,
      onError: options?.onError,
      onMark: options?.onMark,
      onPause: options?.onPause,
      onResume: options?.onResume,
      onStart: options?.onStart,
      onStopped: options?.onStopped,
      volume: options?.volume,
    };
  }

  async function flushQueue() {
    if (speaking || !queue.length) {
      return;
    }

    const next = queue.shift();
    if (!next) {
      return;
    }

    speaking = true;
    lastSpokenText = next.text;
    const speechOptions = resolveSpeechOptions(next.options);

    logSpeechEvent(
      logger,
      "info",
      `Speaking queued text (${next.text.length} chars) with voice ${speechOptions.voice || "default"}.`,
    );

    Speech.speak(next.text, {
      ...speechOptions,
      onDone: () => {
        speaking = false;
        speechOptions.onDone?.();
        logSpeechEvent(logger, "info", "Speech playback completed.");
        next.resolve();
        void flushQueue();
      },
      onStopped: () => {
        speaking = false;
        speechOptions.onStopped?.();
        logSpeechEvent(logger, "warning", "Speech playback stopped before completion.");
        next.resolve();
        void flushQueue();
      },
      onError: (error) => {
        speaking = false;
        speechOptions.onError?.(error);
        logSpeechEvent(
          logger,
          "error",
          error instanceof Error ? error.message : "Speech synthesis failed.",
        );
        next.reject(error instanceof Error ? error : new Error("Speech synthesis failed."));
        void flushQueue();
      },
    });
  }

  return {
    async initialize() {
      await initialize();
    },

    async enqueue(text: string, options?: SpeechRequestOptions) {
      logSpeechEvent(logger, "info", `Queueing speech: "${text}"`);
      if (options?.replaceQueue) {
        queue.length = 0;
      }
      if (options?.interrupt && speaking) {
        logSpeechEvent(logger, "warning", "Interrupting active speech for a higher-priority utterance.");
        await Speech.stop();
      }
      return new Promise<void>((resolve, reject) => {
        queue.push({ text, options, resolve, reject });
        void flushQueue();
      });
    },

    async stop() {
      logSpeechEvent(logger, "warning", "Stopping speech queue.");
      queue.length = 0;
      await Speech.stop();
      speaking = false;
    },

    async repeatLast(options?: SpeechRequestOptions) {
      if (!lastSpokenText) {
        logSpeechEvent(logger, "warning", "Repeat requested before any speech was played.");
        return;
      }
      await this.enqueue(lastSpokenText, options);
    },

    getQueueDepth() {
      return queue.length + (speaking ? 1 : 0);
    },

    getAvailableVoices() {
      return availableVoices.slice();
    },
  };
}
