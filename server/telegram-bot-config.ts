import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { platformSettings } from "@shared/schema";

export const TELEGRAM_BOT_SERVICES = ["mobile", "aadhar", "vehicle", "email", "ip"] as const;
export type TelegramBotService = typeof TELEGRAM_BOT_SERVICES[number];
export type TelegramMaskingLevel = "light" | "medium" | "heavy";

export interface TelegramBotSettings {
  enabled: boolean;
  allowedGroupIds: string[];
  apiKey: string | null;
  maskingLevel: TelegramMaskingLevel;
  groupRateLimit: number;
  userRateLimit: number;
  dailySearchLimit: number;
  allowedServices: TelegramBotService[];
}

const SETTINGS_KEY = "telegram_bot_config";
const DEFAULT_SETTINGS: TelegramBotSettings = {
  enabled: false,
  allowedGroupIds: [],
  apiKey: null,
  maskingLevel: "medium",
  groupRateLimit: 10,
  userRateLimit: 5,
  dailySearchLimit: 100,
  allowedServices: [...TELEGRAM_BOT_SERVICES],
};

let cached: { settings: TelegramBotSettings; expiresAt: number } | null = null;

function normalisePositiveInt(value: unknown, fallback: number, max = 100_000): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= max ? parsed : fallback;
}

function parseSettings(raw: string | null): TelegramBotSettings {
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const value = JSON.parse(raw) as Partial<TelegramBotSettings>;
    const maskingLevel = value.maskingLevel === "light" || value.maskingLevel === "heavy"
      ? value.maskingLevel
      : "medium";
    const allowedServices = Array.isArray(value.allowedServices)
      ? value.allowedServices.filter((service): service is TelegramBotService =>
          (TELEGRAM_BOT_SERVICES as readonly string[]).includes(service),
        )
      : [];
    return {
      enabled: value.enabled === true,
      allowedGroupIds: Array.isArray(value.allowedGroupIds)
        ? value.allowedGroupIds.map(String).map((id) => id.trim()).filter(Boolean)
        : [],
      apiKey: typeof value.apiKey === "string" && value.apiKey.trim() ? value.apiKey.trim() : null,
      maskingLevel,
      groupRateLimit: normalisePositiveInt(value.groupRateLimit, DEFAULT_SETTINGS.groupRateLimit),
      userRateLimit: normalisePositiveInt(value.userRateLimit, DEFAULT_SETTINGS.userRateLimit),
      dailySearchLimit: normalisePositiveInt(value.dailySearchLimit, DEFAULT_SETTINGS.dailySearchLimit),
      allowedServices,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function getTelegramBotSettings(): Promise<TelegramBotSettings> {
  if (cached && cached.expiresAt > Date.now()) return cached.settings;
  const [row] = await db.select({ value: platformSettings.value })
    .from(platformSettings)
    .where(eq(platformSettings.key, SETTINGS_KEY));
  const settings = parseSettings(row?.value || null);
  cached = { settings, expiresAt: Date.now() + 5_000 };
  return settings;
}

export function invalidateTelegramBotSettings(): void {
  cached = null;
}

export async function saveTelegramBotSettings(
  input: Partial<Omit<TelegramBotSettings, "apiKey">> & { apiKey?: string | null },
): Promise<TelegramBotSettings> {
  const current = await getTelegramBotSettings();
  const next: TelegramBotSettings = {
    enabled: input.enabled ?? current.enabled,
    allowedGroupIds: input.allowedGroupIds ?? current.allowedGroupIds,
    apiKey: input.apiKey === undefined ? current.apiKey : (input.apiKey?.trim() || null),
    maskingLevel: input.maskingLevel ?? current.maskingLevel,
    groupRateLimit: input.groupRateLimit ?? current.groupRateLimit,
    userRateLimit: input.userRateLimit ?? current.userRateLimit,
    dailySearchLimit: input.dailySearchLimit ?? current.dailySearchLimit,
    allowedServices: input.allowedServices ?? current.allowedServices,
  };
  await db.insert(platformSettings)
    .values({ key: SETTINGS_KEY, value: JSON.stringify(next) })
    .onConflictDoUpdate({
      target: platformSettings.key,
      set: { value: JSON.stringify(next), updatedAt: new Date() },
    });
  invalidateTelegramBotSettings();
  return next;
}

export async function generateTelegramBotApiKey(): Promise<string> {
  const apiKey = `twh_tg_${crypto.randomBytes(24).toString("base64url")}`;
  await saveTelegramBotSettings({ apiKey });
  return apiKey;
}

export function getTelegramBotSettingsForAdmin(settings: TelegramBotSettings) {
  return {
    enabled: settings.enabled,
    allowedGroupIds: settings.allowedGroupIds,
    apiKeySet: Boolean(settings.apiKey),
    apiKeyPreview: settings.apiKey ? `${settings.apiKey.slice(0, 12)}…` : null,
    maskingLevel: settings.maskingLevel,
    groupRateLimit: settings.groupRateLimit,
    userRateLimit: settings.userRateLimit,
    dailySearchLimit: settings.dailySearchLimit,
    allowedServices: settings.allowedServices,
  };
}