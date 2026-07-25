import type { TelegramMaskingLevel } from "./telegram-bot-config";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function stars(length: number): string {
  return "*".repeat(Math.max(3, Math.min(length, 8)));
}

function maskWord(word: string, level: TelegramMaskingLevel): string {
  if (!word || word.length <= 2) return "*".repeat(word.length);
  if (level === "light") return `${word.slice(0, 2)}${stars(word.length - 4)}${word.slice(-2)}`;
  if (level === "heavy") return `${word[0]}${stars(word.length - 1)}`;
  return `${word[0]}${stars(word.length - 2)}${word.slice(-1)}`;
}

function maskText(value: string, level: TelegramMaskingLevel): string {
  return value.split(/(\s+)/).map((part) => /^\s+$/.test(part) ? part : maskWord(part, level)).join("");
}

function maskEmail(value: string, level: TelegramMaskingLevel): string {
  const [local, ...domainParts] = value.split("@");
  if (!local || domainParts.length === 0) return maskText(value, level);
  const domain = domainParts.join("@");
  const domainPartsWithTld = domain.split(".");
  const maskedDomain = domainPartsWithTld.map((part, index) =>
    index === domainPartsWithTld.length - 1 ? part : maskWord(part, level),
  ).join(".");
  return `${maskWord(local, level)}@${maskedDomain}`;
}

function maskDigits(value: string, key: string, level: TelegramMaskingLevel): string {
  const compact = value.replace(/\s+/g, "");
  const isAadhaar = /aadhaar|aadhar/.test(key);
  const isPan = /\bpan\b/.test(key);
  const isVehicle = /vehicle|registration|rc_number|rc$/.test(key);
  const keep = isAadhaar ? 4 : isPan ? 3 : isVehicle ? 4 : level === "light" ? 4 : level === "heavy" ? 2 : 3;
  if (compact.length <= keep * 2) return `${compact[0] || ""}${stars(compact.length - 2)}${compact.slice(-1)}`;
  return `${compact.slice(0, keep)}${stars(compact.length - keep * 2)}${compact.slice(-keep)}`;
}

function maskDate(value: string, level: TelegramMaskingLevel): string {
  const match = value.match(/^(\d{1,2})([-/])(\d{1,2})([-/])(\d{2,4})$/);
  if (!match) return maskText(value, level);
  if (level === "light") return `${match[1]}${match[2]}**${match[4]}${match[5]}`;
  if (level === "heavy") return `**${match[2]}**${match[4]}****`;
  return `${match[1]}${match[2]}**${match[4]}${match[5]}`;
}

function maskString(value: string, key: string, level: TelegramMaskingLevel): string {
  const lowerKey = key.toLowerCase();
  if (/email|e_mail/.test(lowerKey) || value.includes("@")) return maskEmail(value, level);
  if (/dob|birth|date_of_birth/.test(lowerKey) && /\d/.test(value)) return maskDate(value, level);
  if (/\d/.test(value) && /mobile|phone|number|aadhaar|aadhar|pan|vehicle|registration|rc|chassis|engine|id_number/.test(lowerKey)) {
    return maskDigits(value, lowerKey, level);
  }
  return maskText(value, level);
}

export function maskTelegramResult(value: unknown, level: TelegramMaskingLevel, key = "value"): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.slice(0, 10).map((item) => maskTelegramResult(item, level, key));
  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => [
      childKey,
      maskTelegramResult(childValue, level, childKey),
    ]));
  }
  if (typeof value === "string") return maskString(value, key, level);
  return value;
}

export function formatTelegramBotResult(
  service: string,
  query: string,
  result: unknown,
  level: TelegramMaskingLevel,
): string {
  const masked = maskTelegramResult(result, level);
  const body = escapeHtml(JSON.stringify(masked, null, 2).slice(0, 3000));
  return [
    `🔍 <b>${service.toUpperCase()} LOOKUP</b>`,
    `Query: <code>${escapeHtml(maskString(query, service, level))}</code>`,
    "",
    `<pre>${body}</pre>`,
    "",
    `🛡 Masking: <b>${level.toUpperCase()}</b>`,
  ].join("\n");
}