import * as SQLite from "expo-sqlite";

import { AppSettings, ModelMetadata } from "../types/app";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync("visionedge.db");
  }
  return databasePromise;
}

export type SessionLogEntry = {
  id: string;
  level: "info" | "warning" | "error";
  message: string;
  createdAt: number;
};

const defaultSettings: AppSettings = {
  speechRate: 1,
  verbosity: "standard",
  audioOutputMode: "speaker",
  vibrationEnabled: true,
  lowLightAlertsEnabled: true,
  geminiFallbackEnabled: false,
  confirmActions: true,
  debugMode: true,
};

export const settingsRepository = {
  async init() {
    const db = await getDatabase();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY NOT NULL,
        speech_rate REAL NOT NULL,
        verbosity TEXT NOT NULL,
        audio_output_mode TEXT NOT NULL,
        vibration_enabled INTEGER NOT NULL,
        low_light_alerts_enabled INTEGER NOT NULL,
        gemini_fallback_enabled INTEGER NOT NULL,
        confirm_actions INTEGER NOT NULL,
        debug_mode INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS model_metadata (
        id TEXT PRIMARY KEY NOT NULL,
        model_type TEXT NOT NULL,
        model_version TEXT NOT NULL,
        quantization_type TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS session_log (
        id TEXT PRIMARY KEY NOT NULL,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    const existing = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM user_preferences",
    );

    if (!existing?.count) {
      await this.saveSettings(defaultSettings);
    }
  },

  async getSettings(): Promise<AppSettings> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{
      speech_rate: number;
      verbosity: AppSettings["verbosity"];
      audio_output_mode: AppSettings["audioOutputMode"];
      vibration_enabled: number;
      low_light_alerts_enabled: number;
      gemini_fallback_enabled: number;
      confirm_actions: number;
      debug_mode: number;
    }>("SELECT * FROM user_preferences LIMIT 1");

    if (!row) {
      return defaultSettings;
    }

    return {
      speechRate: row.speech_rate,
      verbosity: row.verbosity,
      audioOutputMode: row.audio_output_mode,
      vibrationEnabled: Boolean(row.vibration_enabled),
      lowLightAlertsEnabled: Boolean(row.low_light_alerts_enabled),
      geminiFallbackEnabled: Boolean(row.gemini_fallback_enabled),
      confirmActions: Boolean(row.confirm_actions),
      debugMode: Boolean(row.debug_mode),
    };
  },

  async saveSettings(settings: AppSettings) {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM user_preferences");
    await db.runAsync(
      `
        INSERT INTO user_preferences (
          id,
          speech_rate,
          verbosity,
          audio_output_mode,
          vibration_enabled,
          low_light_alerts_enabled,
          gemini_fallback_enabled,
          confirm_actions,
          debug_mode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      1,
      settings.speechRate,
      settings.verbosity,
      settings.audioOutputMode,
      settings.vibrationEnabled ? 1 : 0,
      settings.lowLightAlertsEnabled ? 1 : 0,
      settings.geminiFallbackEnabled ? 1 : 0,
      settings.confirmActions ? 1 : 0,
      settings.debugMode ? 1 : 0,
    );
  },

  async seedDefaultMetadata() {
    const db = await getDatabase();
    const defaults: ModelMetadata[] = [
      {
        id: "vision-yolo26s",
        modelType: "VISION",
        modelVersion: "yolo26s_float16_320",
        quantizationType: "FLOAT16",
      },
      {
        id: "tts-android-system",
        modelType: "TTS",
        modelVersion: "android-system-tts",
        quantizationType: "SYSTEM",
      },
      {
        id: "gemini-fallback",
        modelType: "VISION",
        modelVersion: "gemini-2.0-flash",
        quantizationType: "REMOTE_OPTIONAL",
      },
    ];

    for (const item of defaults) {
      await db.runAsync(
        `
          INSERT OR REPLACE INTO model_metadata (id, model_type, model_version, quantization_type)
          VALUES (?, ?, ?, ?)
        `,
        item.id,
        item.modelType,
        item.modelVersion,
        item.quantizationType,
      );
    }
  },

  async getModelMetadata(): Promise<ModelMetadata[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      id: string;
      model_type: ModelMetadata["modelType"];
      model_version: string;
      quantization_type: string;
    }>("SELECT * FROM model_metadata ORDER BY model_type, id");

    return rows.map((item) => ({
      id: item.id,
      modelType: item.model_type,
      modelVersion: item.model_version,
      quantizationType: item.quantization_type,
    }));
  },

  async addSessionLog(entry: SessionLogEntry) {
    const db = await getDatabase();
    await db.runAsync(
      `
        INSERT OR REPLACE INTO session_log (id, level, message, created_at)
        VALUES (?, ?, ?, ?)
      `,
      entry.id,
      entry.level,
      entry.message,
      entry.createdAt,
    );
  },

  async getRecentLogs(): Promise<SessionLogEntry[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      id: string;
      level: SessionLogEntry["level"];
      message: string;
      created_at: number;
    }>("SELECT * FROM session_log ORDER BY created_at DESC LIMIT 12");

    return rows.map((item) => ({
      id: item.id,
      level: item.level,
      message: item.message,
      createdAt: item.created_at,
    }));
  },
};
