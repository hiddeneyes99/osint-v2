import { storage } from "../../server/storage";
import { sendCleanupReport } from "../../server/telegram";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const secret = req.headers["x-cron-secret"] || req.query.secret;
  const expectedSecret = process.env.CRON_SECRET || "twh-cron-2024";
  if (secret !== expectedSecret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const todayIST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    console.log(`[cron/cleanup] Starting scheduled cleanup for ${todayIST}...`);

    const logsToDelete = await storage.fetchLogsBeforeCleanup(0);

    if (logsToDelete.length > 0) {
      console.log(`[cron/cleanup] Sending ${logsToDelete.length} records to Telegram...`);
      await sendCleanupReport(logsToDelete);
    }

    const result = await storage.cleanupAllRequestLogs();
    console.log(`[cron/cleanup] Purged ${result.deletedLogs} request_logs on ${todayIST}`);

    res.json({
      success: true,
      date: todayIST,
      recordsSent: logsToDelete.length,
      recordsDeleted: result.deletedLogs,
    });
  } catch (err: any) {
    console.error("[cron/cleanup] Error:", err);
    res.status(500).json({ message: err.message || "Cleanup failed" });
  }
}
