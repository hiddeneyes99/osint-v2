import {
  users, requestLogs, protectedNumbers, broadcastMessages,
  userNotes, loginActivity, notifications, platformSettings, ads,
  type User, type UpsertUser, type RequestLog, type BroadcastMessage,
  type UserNote, type LoginActivity, type Notification, type Ad
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and, gte, desc } from "drizzle-orm";

export interface AdminStats {
  totalUsers: number;
  blockedUsers: number;
  ipBlockedUsers: number;
  queriesToday: number;
  queriesThisMonth: number;
  totalQueries: number;
}

export type UserWithStats = User & { queryCount: number };

export interface ChartDataPoint {
  date: string;
  mobile: number;
  aadhar: number;
  vehicle: number;
  ip: number;
  total: number;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  logRequest(userId: string, service: string, query: string, status: string, result?: any): Promise<void>;
  getRequestHistory(userId: string): Promise<RequestLog[]>;
  getUserDailyQueryCount(userId: string): Promise<number>;
  getUserQueryCountSince(userId: string, since: Date): Promise<number>;
  isIpBlocked(ip: string): Promise<boolean>;
  blockIp(ip: string, blocked: boolean): Promise<void>;

  // Admin methods
  getAllUsers(): Promise<User[]>;
  getAllUsersWithStats(): Promise<UserWithStats[]>;
  getAdminStats(): Promise<AdminStats>;
  getQueryChartData(days: number): Promise<ChartDataPoint[]>;
  isNumberProtected(number: string): Promise<string | null>;
  addProtectedNumber(number: string, reason?: string): Promise<void>;
  removeProtectedNumber(number: string): Promise<void>;
  getProtectedNumbers(): Promise<string[]>;

  // Broadcast methods
  createBroadcast(data: {
    title: string; message: string; type: string;
    mediaUrl?: string; mediaType?: string; actionLink?: string;
    buttonText?: string; durationMinutes?: number; startsAt?: string;
  }): Promise<BroadcastMessage>;
  getActiveBroadcasts(): Promise<BroadcastMessage[]>;
  deleteBroadcast(id: number): Promise<void>;

  // User notes
  addUserNote(userId: string, note: string): Promise<UserNote>;
  getUserNotes(userId: string): Promise<UserNote[]>;
  deleteUserNote(id: number): Promise<void>;

  // Login activity
  logLoginActivity(userId: string, ip: string, userAgent: string): Promise<void>;
  getLoginActivity(userId: string): Promise<LoginActivity[]>;

  // Notifications
  createNotification(userId: string, title: string, message: string): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: number): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  // Platform settings
  getPlatformSetting(key: string): Promise<string | null>;
  setPlatformSetting(key: string, value: string | null): Promise<void>;

  // Ads
  getAllAds(): Promise<Ad[]>;
  getActiveAds(): Promise<Ad[]>;
  getAd(id: number): Promise<Ad | undefined>;
  createAd(data: { title: string; type: string; mediaUrl?: string; htmlContent?: string; linkUrl?: string; logoUrl?: string; description?: string; buttonText?: string; buttonColor?: string; forceRedirect?: boolean; duration: number }): Promise<Ad>;
  updateAd(id: number, data: { title?: string; type?: string; mediaUrl?: string; htmlContent?: string; linkUrl?: string; logoUrl?: string; description?: string; buttonText?: string; buttonColor?: string; forceRedirect?: boolean; duration?: number }): Promise<Ad>;
  deleteAd(id: number): Promise<void>;
  toggleAd(id: number): Promise<Ad>;
  incrementAdViews(id: number): Promise<void>;
  incrementAdClicks(id: number): Promise<void>;

  // Cleanup
  fetchLogsBeforeCleanup(days: number): Promise<LogWithUser[]>;
  cleanupAllRequestLogs(): Promise<{ deletedLogs: number }>;
  cleanupOldLogs(): Promise<{ deletedLogs: number; deletedLoginActivity: number }>;
  getDbSize(): Promise<{ tableName: string; totalSize: string; rawBytes: number; rowCount: number }[]>;
}

export interface LogWithUser {
  id: number;
  userId: string | null;
  email: string | null;
  username: string | null;
  service: string;
  query: string;
  status: string;
  result: any;
  createdAt: Date | null;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return user;
  }

  async logRequest(userId: string, service: string, query: string, status: string, result?: any): Promise<void> {
    await db.insert(requestLogs).values({ userId, service, query, status, result: result || null });
  }

  async getRequestHistory(userId: string): Promise<RequestLog[]> {
    return await db.select().from(requestLogs).where(eq(requestLogs.userId, userId)).orderBy(sql`${requestLogs.createdAt} DESC`);
  }

  async getAllRequestLogs(limit = 300): Promise<Array<RequestLog & { username: string | null; email: string | null }>> {
    return await db
      .select({
        id: requestLogs.id,
        userId: requestLogs.userId,
        service: requestLogs.service,
        query: requestLogs.query,
        status: requestLogs.status,
        result: requestLogs.result,
        createdAt: requestLogs.createdAt,
        username: users.username,
        email: users.email,
      })
      .from(requestLogs)
      .leftJoin(users, eq(requestLogs.userId, users.id))
      .orderBy(desc(requestLogs.createdAt))
      .limit(limit) as any;
  }

  async getUserDailyQueryCount(userId: string): Promise<number> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [{ count }] = await db
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(requestLogs)
      .where(and(eq(requestLogs.userId, userId), gte(requestLogs.createdAt, startOfDay)));
    return count || 0;
  }

  async getUserQueryCountSince(userId: string, since: Date): Promise<number> {
    const [{ count }] = await db
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(requestLogs)
      .where(and(eq(requestLogs.userId, userId), gte(requestLogs.createdAt, since)));
    return count || 0;
  }

  async isIpBlocked(ip: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.lastIp, ip));
    return user ? user.isIpBlocked : false;
  }

  async blockIp(ip: string, blocked: boolean): Promise<void> {
    await db.update(users).set({ isIpBlocked: blocked }).where(eq(users.lastIp, ip));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllUsersWithStats(): Promise<UserWithStats[]> {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        username: users.username,
        role: users.role,
        isBlocked: users.isBlocked,
        lastIp: users.lastIp,
        isIpBlocked: users.isIpBlocked,
        termsAccepted: users.termsAccepted,
        privacyAccepted: users.privacyAccepted,
        credits: users.credits,
        dailyQueryLimit: users.dailyQueryLimit,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        queryCount: sql<number>`CAST(COUNT(${requestLogs.id}) AS INTEGER)`,
      })
      .from(users)
      .leftJoin(requestLogs, eq(users.id, requestLogs.userId))
      .groupBy(users.id)
      .orderBy(sql`${users.createdAt} DESC`);
    return result as UserWithStats[];
  }

  async getAdminStats(): Promise<AdminStats> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [{ totalUsers }] = await db.select({ totalUsers: sql<number>`CAST(COUNT(*) AS INTEGER)` }).from(users);
    const [{ blockedUsers }] = await db.select({ blockedUsers: sql<number>`CAST(COUNT(*) AS INTEGER)` }).from(users).where(eq(users.isBlocked, true));
    const [{ ipBlockedUsers }] = await db.select({ ipBlockedUsers: sql<number>`CAST(COUNT(*) AS INTEGER)` }).from(users).where(eq(users.isIpBlocked, true));
    const [{ totalQueries }] = await db.select({ totalQueries: sql<number>`CAST(COUNT(*) AS INTEGER)` }).from(requestLogs);
    const [{ queriesToday }] = await db.select({ queriesToday: sql<number>`CAST(COUNT(*) AS INTEGER)` }).from(requestLogs).where(gte(requestLogs.createdAt, startOfDay));
    const [{ queriesThisMonth }] = await db.select({ queriesThisMonth: sql<number>`CAST(COUNT(*) AS INTEGER)` }).from(requestLogs).where(gte(requestLogs.createdAt, startOfMonth));

    return {
      totalUsers: totalUsers || 0,
      blockedUsers: blockedUsers || 0,
      ipBlockedUsers: ipBlockedUsers || 0,
      queriesToday: queriesToday || 0,
      queriesThisMonth: queriesThisMonth || 0,
      totalQueries: totalQueries || 0,
    };
  }

  async getQueryChartData(days: number): Promise<ChartDataPoint[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await db
      .select({ service: requestLogs.service, createdAt: requestLogs.createdAt })
      .from(requestLogs)
      .where(gte(requestLogs.createdAt, since))
      .orderBy(requestLogs.createdAt);

    const map: Record<string, ChartDataPoint> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split("T")[0];
      map[key] = { date: key, mobile: 0, aadhar: 0, vehicle: 0, ip: 0, total: 0 };
    }

    for (const row of rows) {
      if (!row.createdAt) continue;
      const key = new Date(row.createdAt).toISOString().split("T")[0];
      if (!map[key]) continue;
      const svc = row.service as keyof Omit<ChartDataPoint, "date" | "total">;
      if (svc in map[key]) (map[key] as any)[svc]++;
      map[key].total++;
    }

    return Object.values(map);
  }

  async isNumberProtected(number: string): Promise<string | null> {
    const [protectedNum] = await db.select().from(protectedNumbers).where(eq(protectedNumbers.number, number));
    return protectedNum ? protectedNum.reason || "BAAP KA RAAZ HAI" : null;
  }

  async addProtectedNumber(number: string, reason?: string): Promise<void> {
    await db.insert(protectedNumbers).values({ number, reason }).onConflictDoNothing();
  }

  async removeProtectedNumber(number: string): Promise<void> {
    await db.delete(protectedNumbers).where(eq(protectedNumbers.number, number));
  }

  async getProtectedNumbers(): Promise<string[]> {
    const results = await db.select({ number: protectedNumbers.number }).from(protectedNumbers);
    return results.map(r => r.number);
  }

  async createBroadcast(data: {
    title: string; message: string; type: string;
    mediaUrl?: string; mediaType?: string; actionLink?: string;
    buttonText?: string; durationMinutes?: number; startsAt?: string;
  }): Promise<BroadcastMessage> {
    const expiresAt = data.durationMinutes ? new Date(Date.now() + data.durationMinutes * 60 * 1000) : null;
    const startsAt = data.startsAt ? new Date(data.startsAt) : null;
    const [broadcast] = await db.insert(broadcastMessages).values({
      title: data.title,
      message: data.message,
      type: data.type,
      mediaUrl: data.mediaUrl || null,
      mediaType: data.mediaType || null,
      actionLink: data.actionLink || null,
      buttonText: data.buttonText || "LEARN MORE",
      isActive: true,
      startsAt,
      expiresAt,
    }).returning();
    return broadcast;
  }

  async getActiveBroadcasts(): Promise<BroadcastMessage[]> {
    const now = new Date();
    const all = await db.select().from(broadcastMessages)
      .where(eq(broadcastMessages.isActive, true))
      .orderBy(sql`${broadcastMessages.createdAt} DESC`);

    const active: BroadcastMessage[] = [];
    for (const b of all) {
      if (b.expiresAt && new Date(b.expiresAt) < now) {
        await db.update(broadcastMessages).set({ isActive: false }).where(eq(broadcastMessages.id, b.id));
        continue;
      }
      if (b.startsAt && new Date(b.startsAt) > now) continue;
      active.push(b);
    }
    return active;
  }

  async deleteBroadcast(id: number): Promise<void> {
    await db.update(broadcastMessages).set({ isActive: false }).where(eq(broadcastMessages.id, id));
  }

  // User notes
  async addUserNote(userId: string, note: string): Promise<UserNote> {
    const [n] = await db.insert(userNotes).values({ userId, note }).returning();
    return n;
  }

  async getUserNotes(userId: string): Promise<UserNote[]> {
    return await db.select().from(userNotes).where(eq(userNotes.userId, userId)).orderBy(desc(userNotes.createdAt));
  }

  async deleteUserNote(id: number): Promise<void> {
    await db.delete(userNotes).where(eq(userNotes.id, id));
  }

  // Login activity
  async logLoginActivity(userId: string, ip: string, userAgent: string): Promise<void> {
    await db.insert(loginActivity).values({ userId, ip, userAgent });
  }

  async getLoginActivity(userId: string): Promise<LoginActivity[]> {
    return await db.select().from(loginActivity)
      .where(eq(loginActivity.userId, userId))
      .orderBy(desc(loginActivity.createdAt))
      .limit(50);
  }

  // Notifications
  async createNotification(userId: string, title: string, message: string): Promise<Notification> {
    const [n] = await db.insert(notifications).values({ userId, title, message }).returning();
    return n;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [{ count }] = await db
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return count || 0;
  }

  async getPlatformSetting(key: string): Promise<string | null> {
    const [row] = await db.select().from(platformSettings).where(eq(platformSettings.key, key));
    return row?.value ?? null;
  }

  async setPlatformSetting(key: string, value: string | null): Promise<void> {
    await db.insert(platformSettings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: platformSettings.key, set: { value, updatedAt: new Date() } });
  }

  async getAllAds(): Promise<Ad[]> {
    return db.select().from(ads).orderBy(desc(ads.createdAt));
  }

  async getActiveAds(): Promise<Ad[]> {
    return db.select().from(ads).where(eq(ads.isActive, true));
  }

  async getAd(id: number): Promise<Ad | undefined> {
    const [ad] = await db.select().from(ads).where(eq(ads.id, id));
    return ad;
  }

  async createAd(data: { title: string; type: string; mediaUrl?: string; htmlContent?: string; linkUrl?: string; logoUrl?: string; description?: string; buttonText?: string; buttonColor?: string; forceRedirect?: boolean; duration: number }): Promise<Ad> {
    const [ad] = await db.insert(ads).values(data).returning();
    return ad;
  }

  async updateAd(id: number, data: { title?: string; type?: string; mediaUrl?: string; htmlContent?: string; linkUrl?: string; logoUrl?: string; description?: string; buttonText?: string; buttonColor?: string; forceRedirect?: boolean; duration?: number }): Promise<Ad> {
    const [updated] = await db.update(ads).set(data).where(eq(ads.id, id)).returning();
    return updated;
  }

  async deleteAd(id: number): Promise<void> {
    await db.delete(ads).where(eq(ads.id, id));
  }

  async toggleAd(id: number): Promise<Ad> {
    const [current] = await db.select().from(ads).where(eq(ads.id, id));
    const [updated] = await db.update(ads).set({ isActive: !current.isActive }).where(eq(ads.id, id)).returning();
    return updated;
  }

  async incrementAdViews(id: number): Promise<void> {
    await db.update(ads).set({ views: sql`${ads.views} + 1` }).where(eq(ads.id, id));
  }

  async incrementAdClicks(id: number): Promise<void> {
    await db.update(ads).set({ clicks: sql`${ads.clicks} + 1` }).where(eq(ads.id, id));
  }

  async cleanupAllRequestLogs(): Promise<{ deletedLogs: number }> {
    const deleted = await db
      .delete(requestLogs)
      .returning({ id: requestLogs.id });
    return { deletedLogs: deleted.length };
  }

  async fetchLogsBeforeCleanup(days: number): Promise<LogWithUser[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await db
      .select({
        id: requestLogs.id,
        userId: requestLogs.userId,
        service: requestLogs.service,
        query: requestLogs.query,
        status: requestLogs.status,
        result: requestLogs.result,
        createdAt: requestLogs.createdAt,
        email: users.email,
        username: users.username,
      })
      .from(requestLogs)
      .leftJoin(users, eq(requestLogs.userId, users.id))
      .where(sql`${requestLogs.createdAt} < ${cutoff}`)
      .orderBy(desc(requestLogs.createdAt));
    return rows;
  }

  async cleanupOldLogs(): Promise<{ deletedLogs: number; deletedLoginActivity: number }> {
    const cutoff7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Delete request_logs older than 7 days
    const deletedLogsRows = await db
      .delete(requestLogs)
      .where(sql`${requestLogs.createdAt} < ${cutoff7d}`)
      .returning({ id: requestLogs.id });

    // Delete login_activity older than 7 days
    const deletedLoginRows = await db
      .delete(loginActivity)
      .where(sql`${loginActivity.createdAt} < ${cutoff7d}`)
      .returning({ id: loginActivity.id });

    // Also enforce a hard cap: keep only the latest 2000 request_logs
    await db.execute(sql`
      DELETE FROM request_logs
      WHERE id NOT IN (
        SELECT id FROM request_logs ORDER BY created_at DESC LIMIT 2000
      )
    `);

    return {
      deletedLogs: deletedLogsRows.length,
      deletedLoginActivity: deletedLoginRows.length,
    };
  }

  async getDbSize(): Promise<{ tableName: string; totalSize: string; rawBytes: number; rowCount: number }[]> {
    const result = await db.execute(sql`
      SELECT 
        relname AS table_name,
        pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
        pg_total_relation_size(relid) AS raw_bytes,
        n_live_tup AS row_count
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(relid) DESC
    `);
    return (result.rows as any[]).map(r => ({
      tableName: r.table_name,
      totalSize: r.total_size,
      rawBytes: Number(r.raw_bytes),
      rowCount: Number(r.row_count),
    }));
  }
}

export const storage = new DatabaseStorage();
