import { db } from "./db";
import { platformSettings, users } from "@shared/schema";
import { eq, isNotNull } from "drizzle-orm";

// ── SETTINGS CACHE ────────────────────────────────────────────────────────────
let settingsCache: { token: string | null; adminChatIds: string[]; ts: number } | null = null;
const CACHE_TTL = 60_000;

function parseAdminIds(raw: string | null): string[] {
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function getTelegramSettings(): Promise<{ token: string | null; adminChatIds: string[] }> {
  if (settingsCache && Date.now() - settingsCache.ts < CACHE_TTL) {
    return { token: settingsCache.token, adminChatIds: settingsCache.adminChatIds };
  }
  const rows = await db.select().from(platformSettings).where(
    eq(platformSettings.key, "telegram_bot_token")
  );
  const adminRows = await db.select().from(platformSettings).where(
    eq(platformSettings.key, "telegram_admin_chat_id")
  );
  const token = rows[0]?.value || null;
  const adminChatIds = parseAdminIds(adminRows[0]?.value || null);
  settingsCache = { token, adminChatIds, ts: Date.now() };
  return { token, adminChatIds };
}

export function invalidateSettingsCache() {
  settingsCache = null;
}

// ── COUNTRY FLAG EMOJI ────────────────────────────────────────────────────────
function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "";
  return Array.from(code.toUpperCase())
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

// ── FOOTER LINE ───────────────────────────────────────────────────────────────
const FOOTER = `\n🤖 <a href="https://twh-osint.vercel.app/">TWH_OSINT Platform</a>\n👨‍💻 @technicalwhitehat`;

function formatTime(): string {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

// ── FORMAT HELPERS ────────────────────────────────────────────────────────────
export function formatMobileAlert(query: string, data: any): string {
  const header = `🔍 <b>MOBILE LOOKUP RESULT</b>\n━━━━━━━━━━━━━━━━━━━━━━\n📱 Number: <code>${query}</code>\n`;

  const result = Array.isArray(data?.result) ? data.result[0] : null;
  if (!result || (!result.name && !result.mobile)) {
    return `${header}\n❌ <b>NOT FOUND</b>\nNo records available for this number.\n\n⏰ ${formatTime()}${FOOTER}`;
  }

  const na = (v: any) => (v && String(v).trim() && String(v).trim() !== "undefined" ? String(v).trim() : "N/A");
  const address = na(result.address);
  const mapsLink = address !== "N/A"
    ? `\n📍 <a href="https://maps.google.com/?q=${encodeURIComponent(address)}">View on Google Maps</a>`
    : "";

  return `${header}
✅ <b>FOUND</b>

👤 Name: ${na(result.name)}
👨 Father: ${na(result.father_name)}
📧 Email: ${na(result.email)}
📲 Alt Mobile: ${na(result.alt_mobile)}
🏢 Circle: ${na(result.circle)}
🪪 ID: ${na(result.id_number)}
🏠 Address: ${address}${mapsLink}

⏰ ${formatTime()}${FOOTER}`;
}

export function formatIpAlert(query: string, data: any): string {
  const header = `🔍 <b>IP LOOKUP RESULT</b>\n━━━━━━━━━━━━━━━━━━━━━━\n🌐 IP: <code>${query}</code>\n`;

  if (!data || data.status === "fail" || (!data.country && !data.city)) {
    return `${header}\n❌ <b>NOT FOUND</b>\nUnable to resolve data for this IP.\n\n⏰ ${formatTime()}${FOOTER}`;
  }

  const na = (v: any) => (v !== null && v !== undefined && String(v).trim() ? String(v).trim() : "N/A");
  const flag = countryFlag(data.countryCode || "");
  const proxy = data.proxy ? "Yes ⚠️" : "No";
  const mobile = data.mobile ? "Yes" : "No";
  const hosting = data.hosting ? "Yes" : "No";
  const offset = data.offset !== undefined ? `UTC${data.offset >= 0 ? "+" : ""}${data.offset / 3600}` : "N/A";

  return `${header}
✅ <b>FOUND</b>

🏙 City: ${na(data.city)}
🗺 Region: ${na(data.regionName)}
🌍 Country: ${na(data.country)} ${flag}
🗾 Continent: ${na(data.continent)}
📡 ISP: ${na(data.isp)}
🏢 Org: ${na(data.org)}
🔗 AS: ${na(data.as)}
📮 ZIP: ${na(data.zip)}
📍 Lat/Lon: ${na(data.lat)}, ${na(data.lon)}
🕐 Timezone: ${na(data.timezone)} (${offset})
💰 Currency: ${na(data.currency)}
↩️ Reverse: ${na(data.reverse)}
🔒 Proxy: ${proxy} | 📱 Mobile: ${mobile} | 🖥 Hosting: ${hosting}

⏰ ${formatTime()}${FOOTER}`;
}

// ── LOW-LEVEL SEND ────────────────────────────────────────────────────────────
interface SendOptions {
  parseMode?: "HTML" | "Markdown";
  inlineKeyboard?: Array<Array<{ text: string; url: string }>>;
}

async function sendMessage(token: string, chatId: string, text: string, opts: SendOptions = {}): Promise<{ ok: boolean; error?: string }> {
  try {
    const body: any = {
      chat_id: chatId,
      text,
      parse_mode: opts.parseMode || "HTML",
      disable_web_page_preview: false,
    };
    if (opts.inlineKeyboard?.length) {
      body.reply_markup = { inline_keyboard: opts.inlineKeyboard };
    }
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("[Telegram] sendMessage failed:", JSON.stringify(errData));
      return { ok: false, error: errData.description || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e: any) {
    console.error("[Telegram] sendMessage exception:", e.message);
    return { ok: false, error: e.message };
  }
}

async function sendPhoto(token: string, chatId: string, photoUrl: string, caption: string, opts: SendOptions = {}): Promise<boolean> {
  try {
    const body: any = {
      chat_id: chatId,
      photo: photoUrl,
      caption,
      parse_mode: opts.parseMode || "HTML",
    };
    if (opts.inlineKeyboard?.length) {
      body.reply_markup = { inline_keyboard: opts.inlineKeyboard };
    }
    const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch { return false; }
}

async function sendVideo(token: string, chatId: string, videoUrl: string, caption: string, opts: SendOptions = {}): Promise<boolean> {
  try {
    const body: any = {
      chat_id: chatId,
      video: videoUrl,
      caption,
      parse_mode: opts.parseMode || "HTML",
    };
    if (opts.inlineKeyboard?.length) {
      body.reply_markup = { inline_keyboard: opts.inlineKeyboard };
    }
    const res = await fetch(`https://api.telegram.org/bot${token}/sendVideo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch { return false; }
}

// ── SEND DOCUMENT (multipart) ─────────────────────────────────────────────────
async function sendDocument(token: string, chatId: string, filename: string, content: string, caption: string): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("caption", caption);
    formData.append("parse_mode", "HTML");
    formData.append("document", new Blob([content], { type: "text/csv" }), filename);
    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as any;
      console.error("[Telegram] sendDocument failed:", err.description || res.status);
    }
    return res.ok;
  } catch (e: any) {
    console.error("[Telegram] sendDocument exception:", e.message);
    return false;
  }
}

// ── PUBLIC API ────────────────────────────────────────────────────────────────

export async function sendTelegramAdmin(text: string): Promise<void> {
  const { token, adminChatIds } = await getTelegramSettings();
  if (!token || !adminChatIds.length) return;
  for (const chatId of adminChatIds) {
    await sendMessage(token, chatId, text);
  }
}

export async function sendTelegramToUser(chatId: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const { token } = await getTelegramSettings();
  if (!token) return { ok: false, error: "Bot token not configured" };
  return await sendMessage(token, chatId, text);
}

// ── 7-DAY AUTO-CLEANUP REPORT ─────────────────────────────────────────────────
export async function sendCleanupReport(logs: Array<{
  id: number; userId: string | null; email: string | null; username: string | null;
  service: string; query: string; status: string; result: any; createdAt: Date | null;
}>): Promise<void> {
  const { token, adminChatIds } = await getTelegramSettings();
  if (!token || !adminChatIds.length || logs.length === 0) return;

  // ── Build CSV ──
  const escCsv = (v: any): string => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = "ID,User ID,Email,Username,Service,Query,Status,Date (IST),Result Preview";
  const rows = logs.map(l => {
    const date = l.createdAt
      ? new Date(l.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true })
      : "";
    const resultPreview = l.result
      ? JSON.stringify(l.result).slice(0, 300)
      : "";
    return [
      l.id, l.userId || "", l.email || "", l.username || "",
      l.service, l.query, l.status, date, resultPreview
    ].map(escCsv).join(",");
  });
  const csvContent = [header, ...rows].join("\n");

  // ── Build summary ──
  const counts = logs.reduce((acc, l) => {
    acc[l.service] = (acc[l.service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const uniqueUsers = new Set(logs.map(l => l.userId).filter(Boolean)).size;
  const dateFrom = logs[logs.length - 1]?.createdAt
    ? new Date(logs[logs.length - 1].createdAt!).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })
    : "—";
  const dateTo = logs[0]?.createdAt
    ? new Date(logs[0].createdAt!).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })
    : "—";

  const serviceLines = Object.entries(counts)
    .map(([svc, n]) => {
      const emoji = svc === "mobile" ? "📱" : svc === "aadhar" ? "🪪" : svc === "vehicle" ? "🚗" : "🌐";
      return `  ${emoji} ${svc.charAt(0).toUpperCase() + svc.slice(1)}: <b>${n}</b>`;
    }).join("\n");

  const summaryText =
    `🗑️ <b>AUTO-CLEANUP REPORT — 7-Day Purge</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📊 Total Records: <b>${logs.length}</b>\n` +
    `👥 Unique Users: <b>${uniqueUsers}</b>\n` +
    `📅 Period: ${dateFrom} → ${dateTo}\n\n` +
    `📋 <b>By Service:</b>\n${serviceLines}\n\n` +
    `📁 Full data → CSV file (sent above)\n` +
    `⏰ ${formatTime()}${FOOTER}`;

  const filename = `twh_osint_history_${new Date().toISOString().slice(0,10)}.csv`;
  const caption = `📁 <b>TWH OSINT — 7-Day History Backup</b>\n${logs.length} records · ${uniqueUsers} users`;

  for (const chatId of adminChatIds) {
    await sendDocument(token, chatId, filename, csvContent, caption);
    await sendMessage(token, chatId, summaryText);
  }
}

export function formatEmailAlert(query: string, data: any): string {
  const header = `🔍 <b>EMAIL LOOKUP RESULT</b>\n━━━━━━━━━━━━━━━━━━━━━━\n📧 Email: <code>${query}</code>\n`;
  const results: any[] = Array.isArray(data?.result) ? data.result : [];
  const total = data?.total_results ?? results.length;

  if (results.length === 0) {
    return `${header}\n❌ <b>RECORD NOT FOUND</b>\nNo data available for this email address.\n\n⏰ ${formatTime()}${FOOTER}`;
  }

  const na = (v: any) => (v && String(v).trim() && String(v).trim() !== "undefined" ? String(v).trim() : "N/A");
  const MAX_RECORDS = 5;
  const shown = results.slice(0, MAX_RECORDS);

  const recordLines = shown.map((r: any, i: number) => {
    const address = na(r.address);
    const mapsLink = address !== "N/A"
      ? `\n      📍 <a href="https://maps.google.com/?q=${encodeURIComponent(address)}">Maps</a>`
      : "";
    return (
      `\n┄┄┄┄┄┄┄┄ Record ${i + 1}${total > 1 ? ` of ${total}` : ""} ┄┄┄┄┄┄┄┄\n` +
      `👤 Name:       ${na(r.name)}\n` +
      `📱 Mobile:     ${na(r.mobile)}\n` +
      `📲 Alt Mobile: ${na(r.alt_mobile)}\n` +
      `👨 Father:     ${na(r.father_name)}\n` +
      `🪪 ID:         ${na(r.id_number)}\n` +
      `🏢 Circle:     ${na(r.circle)}\n` +
      `🏠 Address:    ${address}${mapsLink}`
    );
  }).join("\n");

  const moreNote = total > MAX_RECORDS
    ? `\n\n⚠️ <i>Showing ${MAX_RECORDS} of ${total} records</i>` : "";

  return `${header}📊 Total Records: <b>${total}</b>\n${recordLines}${moreNote}\n\n⏰ ${formatTime()}${FOOTER}`;
}

export function formatAadharAlert(query: string, data: any): string {
  const header = `🔍 <b>AADHAR LOOKUP RESULT</b>\n━━━━━━━━━━━━━━━━━━━━━━\n🪪 Aadhar: <code>${query}</code>\n`;
  const results: any[] = Array.isArray(data?.result) ? data.result : [];
  const total = data?.total_results ?? results.length;

  if (results.length === 0) {
    return `${header}\n❌ <b>RECORD NOT FOUND</b>\nNo data available for this Aadhar number.\n\n⏰ ${formatTime()}${FOOTER}`;
  }

  const na = (v: any) => (v && String(v).trim() && String(v).trim() !== "undefined" ? String(v).trim() : "N/A");
  const MAX_RECORDS = 5;
  const shown = results.slice(0, MAX_RECORDS);

  const recordLines = shown.map((r: any, i: number) => {
    const address = na(r.address);
    const mapsLink = address !== "N/A"
      ? `\n      📍 <a href="https://maps.google.com/?q=${encodeURIComponent(address)}">Maps</a>`
      : "";
    return (
      `\n┄┄┄┄┄┄┄┄ Record ${i + 1}${total > 1 ? ` of ${total}` : ""} ┄┄┄┄┄┄┄┄\n` +
      `👤 Name:       ${na(r.name)}\n` +
      `📱 Mobile:     ${na(r.mobile)}\n` +
      `📲 Alt Mobile: ${na(r.alt_mobile)}\n` +
      `👨 Father:     ${na(r.father_name)}\n` +
      `📧 Email:      ${na(r.email)}\n` +
      `🏢 Circle:     ${na(r.circle)}\n` +
      `🏠 Address:    ${address}${mapsLink}`
    );
  }).join("\n");

  const moreNote = total > MAX_RECORDS
    ? `\n\n⚠️ <i>Showing ${MAX_RECORDS} of ${total} records</i>` : "";

  return `${header}📊 Total Records: <b>${total}</b>\n${recordLines}${moreNote}\n\n⏰ ${formatTime()}${FOOTER}`;
}

export async function sendFormattedAlert(
  chatId: string,
  serviceName: string,
  query: string,
  data: any,
  prefix?: string,
): Promise<boolean> {
  const { token } = await getTelegramSettings();
  if (!token) return false;

  let text = "";
  if (serviceName === "mobile") {
    text = formatMobileAlert(query, data);
  } else if (serviceName === "ip") {
    text = formatIpAlert(query, data);
  } else if (serviceName === "email") {
    text = formatEmailAlert(query, data);
  } else if (serviceName === "aadhar") {
    text = formatAadharAlert(query, data);
  } else {
    text = `🔍 <b>${serviceName.toUpperCase()} LOOKUP RESULT</b>\n━━━━━━━━━━━━━━━━━━━━━━\n🔎 Query: <code>${query}</code>\n\n❓ No formatter for this service.\n\n⏰ ${formatTime()}${FOOTER}`;
  }

  if (prefix) {
    text = prefix + "\n" + text;
  }

  const result = await sendMessage(token, chatId, text);
  return result.ok;
}

// ── WEBHOOK SETUP ─────────────────────────────────────────────────────────────
export async function setupTelegramWebhook(domain: string): Promise<void> {
  const { token } = await getTelegramSettings();
  if (!token) {
    console.log("[Telegram] No bot token set, skipping webhook setup");
    return;
  }
  const webhookUrl = `https://${domain}/api/telegram/webhook`;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl, drop_pending_updates: true }),
    });
    const data = await res.json() as any;
    if (data.ok) {
      console.log(`[Telegram] Webhook registered: ${webhookUrl}`);
    } else {
      console.error("[Telegram] Webhook setup failed:", data.description);
    }
  } catch (e: any) {
    console.error("[Telegram] Webhook setup exception:", e.message);
  }
}

// ── TELEGRAM BROADCAST ────────────────────────────────────────────────────────
export interface TelegramBroadcastPayload {
  text: string;
  buttons?: Array<{ label: string; url: string }>;
  mediaUrl?: string;
  mediaType?: "IMAGE" | "VIDEO" | "YOUTUBE" | string;
}

export async function sendTelegramBroadcast(
  payload: TelegramBroadcastPayload,
): Promise<{ sent: number; failed: number; noToken: boolean; total: number; failedIds: string[] }> {
  const { token } = await getTelegramSettings();
  if (!token) return { sent: 0, failed: 0, noToken: true, total: 0, failedIds: [] };

  const allUsers = await db.select({ telegramChatId: users.telegramChatId })
    .from(users)
    .where(isNotNull(users.telegramChatId));

  const keyboard: Array<Array<{ text: string; url: string }>> = [];
  if (payload.buttons?.length) {
    const row: Array<{ text: string; url: string }> = [];
    for (const btn of payload.buttons) {
      if (btn.label && btn.url) row.push({ text: btn.label, url: btn.url });
    }
    if (row.length) keyboard.push(row);
  }

  const opts: SendOptions = { inlineKeyboard: keyboard };
  let sent = 0;
  let failed = 0;
  const failedIds: string[] = [];

  for (const u of allUsers) {
    if (!u.telegramChatId) continue;
    const chatId = u.telegramChatId;
    let ok = false;

    const mediaType = payload.mediaType?.toUpperCase();
    if (payload.mediaUrl && mediaType === "IMAGE") {
      ok = await sendPhoto(token, chatId, payload.mediaUrl, payload.text, opts);
    } else if (payload.mediaUrl && mediaType === "VIDEO") {
      ok = await sendVideo(token, chatId, payload.mediaUrl, payload.text, opts);
    } else if (payload.mediaUrl && mediaType === "YOUTUBE") {
      const fullText = `${payload.text}\n\n🎬 ${payload.mediaUrl}`;
      const r = await sendMessage(token, chatId, fullText, opts);
      ok = r.ok;
    } else {
      const r = await sendMessage(token, chatId, payload.text, opts);
      ok = r.ok;
    }

    if (ok) { sent++; } else { failed++; failedIds.push(chatId); }
    await new Promise((r) => setTimeout(r, 50));
  }

  return { sent, failed, noToken: false, total: allUsers.length, failedIds };
}
