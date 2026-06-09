"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// shared/models/auth.ts
var import_drizzle_orm, import_pg_core, sessions, users;
var init_auth = __esm({
  "shared/models/auth.ts"() {
    "use strict";
    import_drizzle_orm = require("drizzle-orm");
    import_pg_core = require("drizzle-orm/pg-core");
    sessions = (0, import_pg_core.pgTable)(
      "sessions",
      {
        sid: (0, import_pg_core.varchar)("sid").primaryKey(),
        sess: (0, import_pg_core.jsonb)("sess").notNull(),
        expire: (0, import_pg_core.timestamp)("expire").notNull()
      },
      (table) => [(0, import_pg_core.index)("IDX_session_expire").on(table.expire)]
    );
    users = (0, import_pg_core.pgTable)("users", {
      id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
      email: (0, import_pg_core.varchar)("email").unique(),
      firstName: (0, import_pg_core.varchar)("first_name"),
      lastName: (0, import_pg_core.varchar)("last_name"),
      profileImageUrl: (0, import_pg_core.varchar)("profile_image_url"),
      username: (0, import_pg_core.text)("username").unique(),
      role: (0, import_pg_core.text)("role").notNull().default("user"),
      isBlocked: (0, import_pg_core.boolean)("is_blocked").notNull().default(false),
      lastIp: (0, import_pg_core.text)("last_ip"),
      isIpBlocked: (0, import_pg_core.boolean)("is_ip_blocked").notNull().default(false),
      termsAccepted: (0, import_pg_core.boolean)("terms_accepted").notNull().default(false),
      privacyAccepted: (0, import_pg_core.boolean)("privacy_accepted").notNull().default(false),
      credits: (0, import_pg_core.integer)("credits").notNull().default(10),
      dailyQueryLimit: (0, import_pg_core.integer)("daily_query_limit"),
      telegramChatId: (0, import_pg_core.text)("telegram_chat_id"),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
  }
});

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  aadharInfoSchema: () => aadharInfoSchema,
  broadcastMessages: () => broadcastMessages,
  insertProtectedNumberSchema: () => insertProtectedNumberSchema,
  insertRequestLogSchema: () => insertRequestLogSchema,
  ipInfoSchema: () => ipInfoSchema,
  loginActivity: () => loginActivity,
  mobileInfoSchema: () => mobileInfoSchema,
  notifications: () => notifications,
  platformSettings: () => platformSettings,
  protectedNumbers: () => protectedNumbers,
  requestLogs: () => requestLogs,
  sessions: () => sessions,
  userNotes: () => userNotes,
  users: () => users,
  vehicleInfoSchema: () => vehicleInfoSchema
});
var import_pg_core2, import_drizzle_zod, import_zod, requestLogs, protectedNumbers, broadcastMessages, platformSettings, userNotes, loginActivity, notifications, insertRequestLogSchema, insertProtectedNumberSchema, mobileInfoSchema, aadharInfoSchema, vehicleInfoSchema, ipInfoSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    import_pg_core2 = require("drizzle-orm/pg-core");
    import_drizzle_zod = require("drizzle-zod");
    import_zod = require("zod");
    init_auth();
    init_auth();
    requestLogs = (0, import_pg_core2.pgTable)("request_logs", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      userId: (0, import_pg_core2.varchar)("user_id").references(() => users.id),
      service: (0, import_pg_core2.text)("service").notNull(),
      query: (0, import_pg_core2.text)("query").notNull(),
      status: (0, import_pg_core2.text)("status").notNull(),
      result: (0, import_pg_core2.jsonb)("result"),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    });
    protectedNumbers = (0, import_pg_core2.pgTable)("protected_numbers", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      number: (0, import_pg_core2.text)("number").notNull().unique(),
      reason: (0, import_pg_core2.text)("reason"),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    });
    broadcastMessages = (0, import_pg_core2.pgTable)("broadcast_messages", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      title: (0, import_pg_core2.text)("title").notNull().default("SYSTEM BROADCAST"),
      message: (0, import_pg_core2.text)("message").notNull(),
      type: (0, import_pg_core2.text)("type").notNull().default("INFO"),
      mediaUrl: (0, import_pg_core2.text)("media_url"),
      mediaType: (0, import_pg_core2.text)("media_type"),
      actionLink: (0, import_pg_core2.text)("action_link"),
      buttonText: (0, import_pg_core2.text)("button_text").default("LEARN MORE"),
      isActive: (0, import_pg_core2.boolean)("is_active").notNull().default(true),
      startsAt: (0, import_pg_core2.timestamp)("starts_at"),
      expiresAt: (0, import_pg_core2.timestamp)("expires_at"),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    });
    platformSettings = (0, import_pg_core2.pgTable)("platform_settings", {
      key: (0, import_pg_core2.text)("key").primaryKey(),
      value: (0, import_pg_core2.text)("value"),
      updatedAt: (0, import_pg_core2.timestamp)("updated_at").defaultNow()
    });
    userNotes = (0, import_pg_core2.pgTable)("user_notes", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      userId: (0, import_pg_core2.varchar)("user_id").notNull().references(() => users.id),
      note: (0, import_pg_core2.text)("note").notNull(),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    });
    loginActivity = (0, import_pg_core2.pgTable)("login_activity", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      userId: (0, import_pg_core2.varchar)("user_id").notNull().references(() => users.id),
      ip: (0, import_pg_core2.text)("ip"),
      userAgent: (0, import_pg_core2.text)("user_agent"),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    });
    notifications = (0, import_pg_core2.pgTable)("notifications", {
      id: (0, import_pg_core2.serial)("id").primaryKey(),
      userId: (0, import_pg_core2.varchar)("user_id").notNull().references(() => users.id),
      title: (0, import_pg_core2.text)("title").notNull(),
      message: (0, import_pg_core2.text)("message").notNull(),
      isRead: (0, import_pg_core2.boolean)("is_read").notNull().default(false),
      createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow()
    });
    insertRequestLogSchema = (0, import_drizzle_zod.createInsertSchema)(requestLogs).omit({ id: true, createdAt: true });
    insertProtectedNumberSchema = (0, import_drizzle_zod.createInsertSchema)(protectedNumbers).omit({ id: true, createdAt: true });
    mobileInfoSchema = import_zod.z.object({
      number: import_zod.z.string().regex(/^[0-9]{10}$/, "Must be a valid 10-digit Indian mobile number")
    });
    aadharInfoSchema = import_zod.z.object({
      number: import_zod.z.string().regex(/^[0-9]{16}$/, "Must be a valid 16-digit Aadhar number")
    });
    vehicleInfoSchema = import_zod.z.object({
      number: import_zod.z.string().regex(/^[A-Za-z]{2}[0-9]{2}[A-Za-z0-9]+$/, "Must start with 2 letters, 2 numbers, then alphanumeric")
    });
    ipInfoSchema = import_zod.z.object({
      ip: import_zod.z.string().ip({ version: "v4", message: "Must be a valid IPv4 address" })
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  pool: () => pool
});
var import_node_postgres, import_pg, Pool, DB_URL, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    import_node_postgres = require("drizzle-orm/node-postgres");
    import_pg = __toESM(require("pg"), 1);
    init_schema();
    ({ Pool } = import_pg.default);
    DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
    if (!DB_URL) {
      console.error("WARNING: No database URL set. DB operations will fail.");
    }
    pool = new Pool({
      connectionString: DB_URL || "postgresql://localhost/placeholder",
      ssl: { rejectUnauthorized: false }
    });
    pool.query("SELECT NOW()", (err, res) => {
      if (err) {
        console.error("Database connection error:", err.message);
      } else {
        console.log("Database connected successfully at:", res.rows?.[0]?.now);
      }
    });
    db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });
  }
});

// api/_handler.ts
var import_express = __toESM(require("express"));
var import_express_session = __toESM(require("express-session"));
var import_connect_pg_simple = __toESM(require("connect-pg-simple"));

// server/routes.ts
var import_ws = require("ws");

// server/storage.ts
init_schema();
init_db();
var import_drizzle_orm2 = require("drizzle-orm");
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, updates) {
    const [user] = await db.update(users).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(users.id, id)).returning();
    return user;
  }
  async logRequest(userId, service, query, status, result) {
    await db.insert(requestLogs).values({ userId, service, query, status, result: result || null });
  }
  async getRequestHistory(userId) {
    return await db.select().from(requestLogs).where((0, import_drizzle_orm2.eq)(requestLogs.userId, userId)).orderBy(import_drizzle_orm2.sql`${requestLogs.createdAt} DESC`);
  }
  async getAllRequestLogs(limit = 300) {
    return await db.select({
      id: requestLogs.id,
      userId: requestLogs.userId,
      service: requestLogs.service,
      query: requestLogs.query,
      status: requestLogs.status,
      result: requestLogs.result,
      createdAt: requestLogs.createdAt,
      username: users.username,
      email: users.email
    }).from(requestLogs).leftJoin(users, (0, import_drizzle_orm2.eq)(requestLogs.userId, users.id)).orderBy((0, import_drizzle_orm2.desc)(requestLogs.createdAt)).limit(limit);
  }
  async getUserDailyQueryCount(userId) {
    const now = /* @__PURE__ */ new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [{ count }] = await db.select({ count: import_drizzle_orm2.sql`CAST(COUNT(*) AS INTEGER)` }).from(requestLogs).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(requestLogs.userId, userId), (0, import_drizzle_orm2.gte)(requestLogs.createdAt, startOfDay)));
    return count || 0;
  }
  async isIpBlocked(ip) {
    const [user] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.lastIp, ip));
    return user ? user.isIpBlocked : false;
  }
  async blockIp(ip, blocked) {
    await db.update(users).set({ isIpBlocked: blocked }).where((0, import_drizzle_orm2.eq)(users.lastIp, ip));
  }
  async getAllUsers() {
    return await db.select().from(users);
  }
  async getAllUsersWithStats() {
    const result = await db.select({
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
      queryCount: import_drizzle_orm2.sql`CAST(COUNT(${requestLogs.id}) AS INTEGER)`
    }).from(users).leftJoin(requestLogs, (0, import_drizzle_orm2.eq)(users.id, requestLogs.userId)).groupBy(users.id).orderBy(import_drizzle_orm2.sql`${users.createdAt} DESC`);
    return result;
  }
  async getAdminStats() {
    const now = /* @__PURE__ */ new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [{ totalUsers }] = await db.select({ totalUsers: import_drizzle_orm2.sql`CAST(COUNT(*) AS INTEGER)` }).from(users);
    const [{ blockedUsers }] = await db.select({ blockedUsers: import_drizzle_orm2.sql`CAST(COUNT(*) AS INTEGER)` }).from(users).where((0, import_drizzle_orm2.eq)(users.isBlocked, true));
    const [{ ipBlockedUsers }] = await db.select({ ipBlockedUsers: import_drizzle_orm2.sql`CAST(COUNT(*) AS INTEGER)` }).from(users).where((0, import_drizzle_orm2.eq)(users.isIpBlocked, true));
    const [{ totalQueries }] = await db.select({ totalQueries: import_drizzle_orm2.sql`CAST(COUNT(*) AS INTEGER)` }).from(requestLogs);
    const [{ queriesToday }] = await db.select({ queriesToday: import_drizzle_orm2.sql`CAST(COUNT(*) AS INTEGER)` }).from(requestLogs).where((0, import_drizzle_orm2.gte)(requestLogs.createdAt, startOfDay));
    const [{ queriesThisMonth }] = await db.select({ queriesThisMonth: import_drizzle_orm2.sql`CAST(COUNT(*) AS INTEGER)` }).from(requestLogs).where((0, import_drizzle_orm2.gte)(requestLogs.createdAt, startOfMonth));
    return {
      totalUsers: totalUsers || 0,
      blockedUsers: blockedUsers || 0,
      ipBlockedUsers: ipBlockedUsers || 0,
      queriesToday: queriesToday || 0,
      queriesThisMonth: queriesThisMonth || 0,
      totalQueries: totalQueries || 0
    };
  }
  async getQueryChartData(days) {
    const since = /* @__PURE__ */ new Date();
    since.setDate(since.getDate() - days);
    const rows = await db.select({ service: requestLogs.service, createdAt: requestLogs.createdAt }).from(requestLogs).where((0, import_drizzle_orm2.gte)(requestLogs.createdAt, since)).orderBy(requestLogs.createdAt);
    const map = {};
    for (let i = 0; i < days; i++) {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split("T")[0];
      map[key] = { date: key, mobile: 0, aadhar: 0, vehicle: 0, ip: 0, total: 0 };
    }
    for (const row of rows) {
      if (!row.createdAt) continue;
      const key = new Date(row.createdAt).toISOString().split("T")[0];
      if (!map[key]) continue;
      const svc = row.service;
      if (svc in map[key]) map[key][svc]++;
      map[key].total++;
    }
    return Object.values(map);
  }
  async isNumberProtected(number) {
    const [protectedNum] = await db.select().from(protectedNumbers).where((0, import_drizzle_orm2.eq)(protectedNumbers.number, number));
    return protectedNum ? protectedNum.reason || "BAAP KA RAAZ HAI" : null;
  }
  async addProtectedNumber(number, reason) {
    await db.insert(protectedNumbers).values({ number, reason }).onConflictDoNothing();
  }
  async removeProtectedNumber(number) {
    await db.delete(protectedNumbers).where((0, import_drizzle_orm2.eq)(protectedNumbers.number, number));
  }
  async getProtectedNumbers() {
    const results = await db.select({ number: protectedNumbers.number }).from(protectedNumbers);
    return results.map((r) => r.number);
  }
  async createBroadcast(data) {
    const expiresAt = data.durationMinutes ? new Date(Date.now() + data.durationMinutes * 60 * 1e3) : null;
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
      expiresAt
    }).returning();
    return broadcast;
  }
  async getActiveBroadcasts() {
    const now = /* @__PURE__ */ new Date();
    const all = await db.select().from(broadcastMessages).where((0, import_drizzle_orm2.eq)(broadcastMessages.isActive, true)).orderBy(import_drizzle_orm2.sql`${broadcastMessages.createdAt} DESC`);
    const active = [];
    for (const b of all) {
      if (b.expiresAt && new Date(b.expiresAt) < now) {
        await db.update(broadcastMessages).set({ isActive: false }).where((0, import_drizzle_orm2.eq)(broadcastMessages.id, b.id));
        continue;
      }
      if (b.startsAt && new Date(b.startsAt) > now) continue;
      active.push(b);
    }
    return active;
  }
  async deleteBroadcast(id) {
    await db.update(broadcastMessages).set({ isActive: false }).where((0, import_drizzle_orm2.eq)(broadcastMessages.id, id));
  }
  // User notes
  async addUserNote(userId, note) {
    const [n] = await db.insert(userNotes).values({ userId, note }).returning();
    return n;
  }
  async getUserNotes(userId) {
    return await db.select().from(userNotes).where((0, import_drizzle_orm2.eq)(userNotes.userId, userId)).orderBy((0, import_drizzle_orm2.desc)(userNotes.createdAt));
  }
  async deleteUserNote(id) {
    await db.delete(userNotes).where((0, import_drizzle_orm2.eq)(userNotes.id, id));
  }
  // Login activity
  async logLoginActivity(userId, ip, userAgent) {
    await db.insert(loginActivity).values({ userId, ip, userAgent });
  }
  async getLoginActivity(userId) {
    return await db.select().from(loginActivity).where((0, import_drizzle_orm2.eq)(loginActivity.userId, userId)).orderBy((0, import_drizzle_orm2.desc)(loginActivity.createdAt)).limit(50);
  }
  // Notifications
  async createNotification(userId, title, message) {
    const [n] = await db.insert(notifications).values({ userId, title, message }).returning();
    return n;
  }
  async getUserNotifications(userId) {
    return await db.select().from(notifications).where((0, import_drizzle_orm2.eq)(notifications.userId, userId)).orderBy((0, import_drizzle_orm2.desc)(notifications.createdAt)).limit(50);
  }
  async markNotificationRead(id) {
    await db.update(notifications).set({ isRead: true }).where((0, import_drizzle_orm2.eq)(notifications.id, id));
  }
  async markAllNotificationsRead(userId) {
    await db.update(notifications).set({ isRead: true }).where((0, import_drizzle_orm2.eq)(notifications.userId, userId));
  }
  async getUnreadNotificationCount(userId) {
    const [{ count }] = await db.select({ count: import_drizzle_orm2.sql`CAST(COUNT(*) AS INTEGER)` }).from(notifications).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(notifications.userId, userId), (0, import_drizzle_orm2.eq)(notifications.isRead, false)));
    return count || 0;
  }
  async getPlatformSetting(key) {
    const [row] = await db.select().from(platformSettings).where((0, import_drizzle_orm2.eq)(platformSettings.key, key));
    return row?.value ?? null;
  }
  async setPlatformSetting(key, value) {
    await db.insert(platformSettings).values({ key, value, updatedAt: /* @__PURE__ */ new Date() }).onConflictDoUpdate({ target: platformSettings.key, set: { value, updatedAt: /* @__PURE__ */ new Date() } });
  }
  async cleanupOldLogs() {
    const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1e3);
    const cutoff7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
    const deletedLogsRows = await db.delete(requestLogs).where(import_drizzle_orm2.sql`${requestLogs.createdAt} < ${cutoff24h}`).returning({ id: requestLogs.id });
    const deletedLoginRows = await db.delete(loginActivity).where(import_drizzle_orm2.sql`${loginActivity.createdAt} < ${cutoff7d}`).returning({ id: loginActivity.id });
    await db.execute(import_drizzle_orm2.sql`
      DELETE FROM request_logs
      WHERE id NOT IN (
        SELECT id FROM request_logs ORDER BY created_at DESC LIMIT 2000
      )
    `);
    return {
      deletedLogs: deletedLogsRows.length,
      deletedLoginActivity: deletedLoginRows.length
    };
  }
  async getDbSize() {
    const result = await db.execute(import_drizzle_orm2.sql`
      SELECT 
        relname AS table_name,
        pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
        pg_total_relation_size(relid) AS raw_bytes,
        n_live_tup AS row_count
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(relid) DESC
    `);
    return result.rows.map((r) => ({
      tableName: r.table_name,
      totalSize: r.total_size,
      rawBytes: Number(r.raw_bytes),
      rowCount: Number(r.row_count)
    }));
  }
};
var storage = new DatabaseStorage();

// shared/routes.ts
var import_zod2 = require("zod");
init_schema();
var errorSchemas = {
  validation: import_zod2.z.object({
    message: import_zod2.z.string(),
    field: import_zod2.z.string().optional()
  }),
  unauthorized: import_zod2.z.object({
    message: import_zod2.z.string()
  }),
  serverError: import_zod2.z.object({
    message: import_zod2.z.string()
  })
};
var api = {
  user: {
    me: {
      method: "GET",
      path: "/api/user",
      responses: {
        200: import_zod2.z.object({
          id: import_zod2.z.string(),
          username: import_zod2.z.string()
        }),
        401: errorSchemas.unauthorized
      }
    },
    history: {
      method: "GET",
      path: "/api/user/history",
      responses: {
        200: import_zod2.z.array(import_zod2.z.any()),
        401: errorSchemas.unauthorized
      }
    }
  },
  services: {
    mobile: {
      method: "POST",
      path: "/api/services/mobile",
      input: mobileInfoSchema,
      responses: {
        200: import_zod2.z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    aadhar: {
      method: "POST",
      path: "/api/services/aadhar",
      input: aadharInfoSchema,
      responses: {
        200: import_zod2.z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    vehicle: {
      method: "POST",
      path: "/api/services/vehicle",
      input: vehicleInfoSchema,
      responses: {
        200: import_zod2.z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    ip: {
      method: "POST",
      path: "/api/services/ip",
      input: ipInfoSchema,
      responses: {
        200: import_zod2.z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    }
  }
};

// server/routes.ts
init_schema();

// server/middleware/firebase-auth.ts
var import_firebase_admin = __toESM(require("firebase-admin"), 1);
if (!import_firebase_admin.default.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || "osint-platform-d6b9b";
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
      console.log("Initializing Firebase Admin with Service Account");
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(serviceAccountJson);
      } catch (_parseErr) {
        try {
          serviceAccount = JSON.parse(serviceAccountJson.replace(/\n/g, "\\n"));
        } catch (e2) {
          console.error("Firebase: failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", e2);
        }
      }
      if (serviceAccount) {
        if (serviceAccount.private_key) {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
        }
        import_firebase_admin.default.initializeApp({
          credential: import_firebase_admin.default.credential.cert(serviceAccount),
          projectId
        });
      } else {
        console.warn("Firebase: falling back to project-ID only init (token verification will fail)");
        import_firebase_admin.default.initializeApp({ projectId });
      }
    } else {
      console.log("Initializing Firebase Admin with Project ID only (default credentials)");
      import_firebase_admin.default.initializeApp({ projectId });
    }
  } catch (err) {
    console.error("Firebase initialization error:", err);
    import_firebase_admin.default.initializeApp({ projectId });
  }
}
var firebaseAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await import_firebase_admin.default.auth().verifyIdToken(idToken);
    console.log("Successfully verified token for:", decodedToken.email);
    try {
      let user = await storage.getUser(decodedToken.uid);
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      const ipStr = Array.isArray(ip) ? ip[0] : ip;
      if (!user) {
        console.log("Creating new user in storage:", decodedToken.uid);
        user = await storage.createUser({
          id: decodedToken.uid,
          email: decodedToken.email,
          username: decodedToken.email?.split("@")[0] || "user",
          lastIp: ipStr,
          termsAccepted: req.headers["x-terms-accepted"] === "true",
          privacyAccepted: req.headers["x-privacy-accepted"] === "true"
        });
      } else {
        if (user.isIpBlocked) {
          return res.status(403).json({ message: "Your IP is blocked. Contact Admin." });
        }
        const updates = { lastIp: ipStr };
        if (req.headers["x-terms-accepted"] === "true") updates.termsAccepted = true;
        if (req.headers["x-privacy-accepted"] === "true") updates.privacyAccepted = true;
        await storage.updateUser(user.id, updates);
      }
    } catch (dbError) {
      console.error("Database sync error in auth middleware:", dbError);
    }
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      claims: { sub: decodedToken.uid }
    };
    next();
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    res.status(401).json({
      message: "Unauthorized",
      detail: error instanceof Error ? error.message : "Token verification failed"
    });
  }
};

// server/telegram.ts
init_db();
init_schema();
var import_drizzle_orm3 = require("drizzle-orm");
var settingsCache = null;
var CACHE_TTL = 6e4;
async function getTelegramSettings() {
  if (settingsCache && Date.now() - settingsCache.ts < CACHE_TTL) {
    return { token: settingsCache.token, adminChatId: settingsCache.adminChatId };
  }
  const rows = await db.select().from(platformSettings).where(
    (0, import_drizzle_orm3.eq)(platformSettings.key, "telegram_bot_token")
  );
  const adminRows = await db.select().from(platformSettings).where(
    (0, import_drizzle_orm3.eq)(platformSettings.key, "telegram_admin_chat_id")
  );
  const token = rows[0]?.value || null;
  const adminChatId = adminRows[0]?.value || null;
  settingsCache = { token, adminChatId, ts: Date.now() };
  return { token, adminChatId };
}
function invalidateSettingsCache() {
  settingsCache = null;
}
function countryFlag(code) {
  if (!code || code.length !== 2) return "";
  return Array.from(code.toUpperCase()).map((c) => String.fromCodePoint(127462 + c.charCodeAt(0) - 65)).join("");
}
var FOOTER = `
\u{1F916} <a href="https://twh-osint.vercel.app/">TWH_OSINT Platform</a>
\u{1F468}\u200D\u{1F4BB} @technicalwhitehat`;
function formatTime() {
  return (/* @__PURE__ */ new Date()).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  });
}
function formatMobileAlert(query, data) {
  const header = `\u{1F50D} <b>MOBILE LOOKUP RESULT</b>
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F4F1} Number: <code>${query}</code>
`;
  const result = Array.isArray(data?.result) ? data.result[0] : null;
  if (!result || !result.name && !result.mobile) {
    return `${header}
\u274C <b>NOT FOUND</b>
No records available for this number.

\u23F0 ${formatTime()}${FOOTER}`;
  }
  const na = (v) => v && String(v).trim() && String(v).trim() !== "undefined" ? String(v).trim() : "N/A";
  const address = na(result.address);
  const mapsLink = address !== "N/A" ? `
\u{1F4CD} <a href="https://maps.google.com/?q=${encodeURIComponent(address)}">View on Google Maps</a>` : "";
  return `${header}
\u2705 <b>FOUND</b>

\u{1F464} Name: ${na(result.name)}
\u{1F468} Father: ${na(result.father_name)}
\u{1F4E7} Email: ${na(result.email)}
\u{1F4F2} Alt Mobile: ${na(result.alt_mobile)}
\u{1F3E2} Circle: ${na(result.circle)}
\u{1FAAA} ID: ${na(result.id_number)}
\u{1F3E0} Address: ${address}${mapsLink}

\u23F0 ${formatTime()}${FOOTER}`;
}
function formatIpAlert(query, data) {
  const header = `\u{1F50D} <b>IP LOOKUP RESULT</b>
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F310} IP: <code>${query}</code>
`;
  if (!data || data.status === "fail" || !data.country && !data.city) {
    return `${header}
\u274C <b>NOT FOUND</b>
Unable to resolve data for this IP.

\u23F0 ${formatTime()}${FOOTER}`;
  }
  const na = (v) => v !== null && v !== void 0 && String(v).trim() ? String(v).trim() : "N/A";
  const flag = countryFlag(data.countryCode || "");
  const proxy = data.proxy ? "Yes \u26A0\uFE0F" : "No";
  const mobile = data.mobile ? "Yes" : "No";
  const hosting = data.hosting ? "Yes" : "No";
  const offset = data.offset !== void 0 ? `UTC${data.offset >= 0 ? "+" : ""}${data.offset / 3600}` : "N/A";
  return `${header}
\u2705 <b>FOUND</b>

\u{1F3D9} City: ${na(data.city)}
\u{1F5FA} Region: ${na(data.regionName)}
\u{1F30D} Country: ${na(data.country)} ${flag}
\u{1F5FE} Continent: ${na(data.continent)}
\u{1F4E1} ISP: ${na(data.isp)}
\u{1F3E2} Org: ${na(data.org)}
\u{1F517} AS: ${na(data.as)}
\u{1F4EE} ZIP: ${na(data.zip)}
\u{1F4CD} Lat/Lon: ${na(data.lat)}, ${na(data.lon)}
\u{1F550} Timezone: ${na(data.timezone)} (${offset})
\u{1F4B0} Currency: ${na(data.currency)}
\u21A9\uFE0F Reverse: ${na(data.reverse)}
\u{1F512} Proxy: ${proxy} | \u{1F4F1} Mobile: ${mobile} | \u{1F5A5} Hosting: ${hosting}

\u23F0 ${formatTime()}${FOOTER}`;
}
async function sendMessage(token, chatId, text3, opts = {}) {
  try {
    const body = {
      chat_id: chatId,
      text: text3,
      parse_mode: opts.parseMode || "HTML",
      disable_web_page_preview: false
    };
    if (opts.inlineKeyboard?.length) {
      body.reply_markup = { inline_keyboard: opts.inlineKeyboard };
    }
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("[Telegram] sendMessage failed:", JSON.stringify(errData));
      return { ok: false, error: errData.description || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("[Telegram] sendMessage exception:", e.message);
    return { ok: false, error: e.message };
  }
}
async function sendPhoto(token, chatId, photoUrl, caption, opts = {}) {
  try {
    const body = {
      chat_id: chatId,
      photo: photoUrl,
      caption,
      parse_mode: opts.parseMode || "HTML"
    };
    if (opts.inlineKeyboard?.length) {
      body.reply_markup = { inline_keyboard: opts.inlineKeyboard };
    }
    const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return res.ok;
  } catch {
    return false;
  }
}
async function sendVideo(token, chatId, videoUrl, caption, opts = {}) {
  try {
    const body = {
      chat_id: chatId,
      video: videoUrl,
      caption,
      parse_mode: opts.parseMode || "HTML"
    };
    if (opts.inlineKeyboard?.length) {
      body.reply_markup = { inline_keyboard: opts.inlineKeyboard };
    }
    const res = await fetch(`https://api.telegram.org/bot${token}/sendVideo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return res.ok;
  } catch {
    return false;
  }
}
async function sendTelegramAdmin(text3) {
  const { token, adminChatId } = await getTelegramSettings();
  if (!token || !adminChatId) return;
  await sendMessage(token, adminChatId, text3);
}
async function sendTelegramToUser(chatId, text3) {
  const { token } = await getTelegramSettings();
  if (!token) return { ok: false, error: "Bot token not configured" };
  return await sendMessage(token, chatId, text3);
}
async function sendFormattedAlert(chatId, serviceName, query, data, prefix) {
  const { token } = await getTelegramSettings();
  if (!token) return false;
  let text3 = "";
  if (serviceName === "mobile") {
    text3 = formatMobileAlert(query, data);
  } else if (serviceName === "ip") {
    text3 = formatIpAlert(query, data);
  } else {
    const raw = JSON.stringify(data, null, 2);
    const preview = raw.length > 900 ? raw.slice(0, 900) + "\n..." : raw;
    text3 = `\u{1F50D} <b>${serviceName.toUpperCase()} LOOKUP RESULT</b>
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F50E} Query: <code>${query}</code>

<pre>${preview}</pre>

\u23F0 ${formatTime()}${FOOTER}`;
  }
  if (prefix) {
    text3 = prefix + "\n" + text3;
  }
  const result = await sendMessage(token, chatId, text3);
  return result.ok;
}
async function setupTelegramWebhook(domain) {
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
      body: JSON.stringify({ url: webhookUrl, drop_pending_updates: true })
    });
    const data = await res.json();
    if (data.ok) {
      console.log(`[Telegram] Webhook registered: ${webhookUrl}`);
    } else {
      console.error("[Telegram] Webhook setup failed:", data.description);
    }
  } catch (e) {
    console.error("[Telegram] Webhook setup exception:", e.message);
  }
}
async function sendTelegramBroadcast(payload) {
  const { token } = await getTelegramSettings();
  if (!token) return { sent: 0, failed: 0, noToken: true, total: 0, failedIds: [] };
  const allUsers = await db.select({ telegramChatId: users.telegramChatId }).from(users).where((0, import_drizzle_orm3.isNotNull)(users.telegramChatId));
  const keyboard = [];
  if (payload.buttons?.length) {
    const row = [];
    for (const btn of payload.buttons) {
      if (btn.label && btn.url) row.push({ text: btn.label, url: btn.url });
    }
    if (row.length) keyboard.push(row);
  }
  const opts = { inlineKeyboard: keyboard };
  let sent = 0;
  let failed = 0;
  const failedIds = [];
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
      const fullText = `${payload.text}

\u{1F3AC} ${payload.mediaUrl}`;
      const r = await sendMessage(token, chatId, fullText, opts);
      ok = r.ok;
    } else {
      const r = await sendMessage(token, chatId, payload.text, opts);
      ok = r.ok;
    }
    if (ok) {
      sent++;
    } else {
      failed++;
      failedIds.push(chatId);
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  return { sent, failed, noToken: false, total: allUsers.length, failedIds };
}

// server/routes.ts
var sendTelegram = sendTelegramAdmin;
var serviceStatusCache = null;
serviceStatusCache = null;
var STATUS_TTL = 2 * 60 * 1e3;
async function checkApiStatus(url, timeoutMs = 4e3) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const resp = await fetch(url, { signal: ctrl.signal, method: "HEAD" });
    clearTimeout(t);
    return resp.status < 500 ? "up" : "degraded";
  } catch (_) {
    return "down";
  }
}
var adminClients = /* @__PURE__ */ new Set();
function broadcastToAdmins(payload) {
  const msg = JSON.stringify(payload);
  adminClients.forEach((client) => {
    if (client.readyState === import_ws.WebSocket.OPEN) client.send(msg);
  });
}
var sseClients = /* @__PURE__ */ new Set();
function pushBroadcastEvent(payload) {
  const line = `data: ${JSON.stringify(payload)}

`;
  sseClients.forEach((res) => {
    try {
      res.write(line);
    } catch {
    }
  });
}
async function registerRoutes(httpServer, app2) {
  app2.get("/robots.txt", (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /secret
Disallow: /api/

User-agent: Googlebot
Allow: /
Disallow: /admin
Disallow: /secret
Disallow: /api/

User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://twh-osint.vercel.app/sitemap.xml
`);
  });
  app2.get("/sitemap.xml", (_req, res) => {
    const BASE = "https://twh-osint.vercel.app";
    const now = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const urls = [
      { loc: "/", changefreq: "weekly", priority: "1.0" },
      { loc: "/dashboard", changefreq: "weekly", priority: "0.9" },
      { loc: "/history", changefreq: "monthly", priority: "0.6" },
      { loc: "/about", changefreq: "monthly", priority: "0.5" },
      { loc: "/contact", changefreq: "monthly", priority: "0.5" },
      { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
      { loc: "/terms", changefreq: "yearly", priority: "0.3" }
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${BASE}${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(xml);
  });
  if (httpServer) {
    const wss = new import_ws.WebSocketServer({ server: httpServer, path: "/ws/admin-feed" });
    wss.on("connection", (ws) => {
      adminClients.add(ws);
      ws.on("close", () => adminClients.delete(ws));
      ws.on("error", () => adminClients.delete(ws));
    });
  }
  app2.get("/api/broadcasts/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();
    res.write(`data: ${JSON.stringify({ type: "connected" })}

`);
    sseClients.add(res);
    const heartbeat = setInterval(() => {
      try {
        res.write(": ping\n\n");
      } catch {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 2e4);
    const cleanup = () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    };
    req.on("close", cleanup);
    req.on("error", cleanup);
  });
  const handleServiceRequest = async (req, res, serviceName, query, apiCallback) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) return res.status(401).json({ message: "User not found" });
      if (user.isBlocked) return res.status(403).json({ message: "Your account is restricted. Contact admin to resolve: https://t.me/Twhosint" });
      if (user.isIpBlocked) return res.status(403).json({ message: "Your IP is restricted. Contact admin to resolve: https://t.me/Twhosint" });
      if (user.dailyQueryLimit !== null && user.dailyQueryLimit !== void 0) {
        const todayCount = await storage.getUserDailyQueryCount(user.id);
        if (todayCount >= user.dailyQueryLimit) {
          return res.status(429).json({ message: `Daily query limit reached (${user.dailyQueryLimit}/day). Try again tomorrow.` });
        }
      }
      const protectionReason = await storage.isNumberProtected(query);
      if (protectionReason) return res.status(403).json({ message: "This number is protected", reason: protectionReason });
      let data;
      try {
        data = await apiCallback();
        if (data && data.error) return res.status(400).json({ message: data.error });
      } catch (error) {
        console.error(`${serviceName} API Error:`, error);
        return res.status(500).json({ message: error.message || "External API failed" });
      }
      await storage.logRequest(user.id, serviceName, query, "SUCCESS", data);
      broadcastToAdmins({
        type: "query",
        service: serviceName,
        query,
        userId: user.id,
        username: user.username || user.email || "Unknown",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (user.telegramChatId) {
        sendFormattedAlert(user.telegramChatId, serviceName, query, data);
      }
      const { adminChatId } = await getTelegramSettings();
      if (adminChatId) {
        const userLabel = user.username || user.email || user.id;
        const prefix = `\u{1F464} <b>User:</b> <code>${userLabel}</code>
\u{1F50E} <b>Service:</b> <code>${serviceName.toUpperCase()}</code>
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`;
        sendFormattedAlert(adminChatId, serviceName, query, data, prefix);
      }
      res.json({ success: true, data });
    } catch (error) {
      console.error("Service Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  app2.get("/api/health", async (_req, res) => {
    let dbOk = false;
    try {
      const { pool: pool2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await pool2.query("SELECT 1");
      dbOk = true;
    } catch (e) {
      console.error("[health] DB error:", e.message);
    }
    res.json({
      ok: true,
      db: dbOk,
      env: {
        SUPABASE_DB_URL: !!process.env.SUPABASE_DB_URL,
        DATABASE_URL: !!process.env.DATABASE_URL,
        SESSION_SECRET: !!process.env.SESSION_SECRET,
        FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
        FIREBASE_SERVICE_ACCOUNT: !!process.env.FIREBASE_SERVICE_ACCOUNT
      }
    });
  });
  app2.get("/api/auth/user", firebaseAuthMiddleware, async (req, res) => {
    const fallbackUser = {
      id: req.user.id,
      email: req.user.email ?? null,
      username: (req.user.email ?? "").split("@")[0] || "user",
      firstName: null,
      lastName: null,
      profileImageUrl: null,
      role: "user",
      isBlocked: false,
      lastIp: null,
      isIpBlocked: false,
      termsAccepted: false,
      privacyAccepted: false,
      credits: 10,
      dailyQueryLimit: null,
      telegramChatId: null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    try {
      let user = await storage.getUser(req.user.id);
      if (!user) {
        try {
          const ip2 = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "";
          user = await storage.createUser({
            id: req.user.id,
            email: req.user.email,
            username: (req.user.email ?? "").split("@")[0] || "user",
            lastIp: ip2 || null,
            termsAccepted: req.headers["x-terms-accepted"] === "true",
            privacyAccepted: req.headers["x-privacy-accepted"] === "true"
          });
        } catch (createErr) {
          console.error("[auth/user] Could not create user in DB \u2014 returning fallback:", createErr);
          return res.json(fallbackUser);
        }
      }
      if (!user) return res.json(fallbackUser);
      const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "";
      const ua = req.headers["user-agent"] || "";
      if (ip) {
        Promise.all([
          storage.updateUser(user.id, { lastIp: ip }).catch(() => {
          }),
          storage.logLoginActivity(user.id, ip, ua).catch(() => {
          }),
          storage.getLoginActivity(user.id).then((activity) => {
            if (activity.length === 1 || activity.length > 1 && activity[0].ip !== activity[1]?.ip) {
              sendTelegram(`\u{1F195} <b>USER LOGIN</b>
User: ${user.username || user.email || user.id}
IP: <code>${ip}</code>
Agent: ${ua.slice(0, 80)}`);
            }
          }).catch(() => {
          })
        ]).catch(() => {
        });
      }
      res.json(user);
    } catch (error) {
      console.error("[auth/user] DB error \u2014 returning fallback user:", error);
      res.json(fallbackUser);
    }
  });
  app2.get(api.user.me.path, firebaseAuthMiddleware, async (req, res) => {
    const user = await storage.getUser(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user.id, username: user.username || user.email || "Unknown" });
  });
  app2.patch("/api/user/telegram", firebaseAuthMiddleware, async (req, res) => {
    const { chatId } = req.body;
    const finalId = chatId === "" || chatId === null || chatId === void 0 ? null : String(chatId).trim();
    if (finalId && !/^-?\d+$/.test(finalId)) {
      return res.status(400).json({ message: "Invalid chat ID \u2014 must be a numeric Telegram user/chat ID." });
    }
    if (finalId) {
      const { token } = await getTelegramSettings();
      if (!token) return res.status(400).json({ message: "Telegram bot is not configured yet. Ask admin to set it up." });
      const ok = await sendTelegramToUser(
        finalId,
        '\u2705 <b>TWH OSINT Alerts enabled!</b>\n\nYou will now receive your query results here automatically.\n\n\u{1F916} <a href="https://twh-osint.vercel.app/">TWH_OSINT Platform</a>\n\u{1F468}\u200D\u{1F4BB} @technicalwhitehat'
      );
      if (!ok) return res.status(400).json({ message: "Could not send test message. Check your chat ID and make sure you've started the bot." });
    }
    await storage.updateUser(req.user.id, { telegramChatId: finalId });
    res.json({ success: true, chatId: finalId });
  });
  app2.get("/api/services/status", async (_req, res) => {
    if (serviceStatusCache && Date.now() - serviceStatusCache.ts < STATUS_TTL) {
      return res.json(serviceStatusCache.data);
    }
    const aadharUrl = process.env.AADHAR_API_URL;
    const mobileStatusUrl = process.env.MOBILE_API_URL ? process.env.MOBILE_API_URL.replace("{query}", "9999999999") : "https://utthaninternational.com/number/js/api-proxy.php";
    const vehicleUrl = process.env.VEHICLE_API_URL;
    const [mobile, ip, aadhar, vehicle] = await Promise.all([
      checkApiStatus(mobileStatusUrl),
      checkApiStatus("https://ip-api.com/json/1.1.1.1"),
      aadharUrl && aadharUrl !== "MOCK_AADHAR_API" ? checkApiStatus(aadharUrl.replace("{query}", "000000000000")) : Promise.resolve("down"),
      vehicleUrl ? checkApiStatus(vehicleUrl.replace("{query}", "DL1CAB1234")) : Promise.resolve("down")
    ]);
    const data = { mobile, vehicle, ip, aadhar, checkedAt: (/* @__PURE__ */ new Date()).toISOString() };
    serviceStatusCache = { data, ts: Date.now() };
    res.json(data);
  });
  app2.post(api.services.mobile.path, firebaseAuthMiddleware, async (req, res) => {
    const result = mobileInfoSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid mobile number" });
    await handleServiceRequest(req, res, "mobile", result.data.number, async () => {
      const configuredUrl = process.env.MOBILE_API_URL;
      const apiUrl = configuredUrl ? configuredUrl.replace("{query}", result.data.number) : `https://utthaninternational.com/number/js/api-proxy.php?mobile=${result.data.number}`;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8e3);
      let response;
      try {
        response = await fetch(apiUrl, { method: "GET", headers: { "Accept": "application/json" }, signal: ctrl.signal });
        clearTimeout(t);
      } catch (e) {
        clearTimeout(t);
        if (e.name === "AbortError") throw new Error("Mobile API timed out. Try again.");
        throw new Error("Mobile API unreachable. Try again later.");
      }
      if (!response.ok) throw new Error(`Mobile API failed: ${response.status} ${response.statusText}`);
      const raw = await response.json();
      if (raw.status && raw.data) {
        const d = raw.data;
        return {
          query: { type: "mobile_lookup" },
          result: [{ id: d._id, name: d.m_name, mobile: d.m_number, alt_mobile: d.m_alt_number, circle: d.m_circle, father_name: d.m_fname, id_number: d.m_uid, address: d.m_address, email: d.m_email }]
        };
      }
      return raw;
    });
  });
  app2.post(api.services.aadhar.path, firebaseAuthMiddleware, async (req, res) => {
    const result = aadharInfoSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid Aadhar number" });
    await handleServiceRequest(req, res, "aadhar", result.data.number, async () => {
      const apiUrl = process.env.AADHAR_API_URL;
      if (apiUrl && apiUrl !== "MOCK_AADHAR_API") {
        const formattedUrl = apiUrl.replace("{query}", result.data.number);
        const response = await fetch(formattedUrl);
        if (response.ok) return await response.json();
      }
      return { number: "XXXX-XXXX-" + result.data.number.slice(-4), status: "Active", age_band: "20-30", state: "Maharashtra", gender: "Male" };
    });
  });
  app2.post(api.services.vehicle.path, firebaseAuthMiddleware, async (req, res) => {
    const result = vehicleInfoSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid vehicle registration number" });
    const vehicleApiUrl = process.env.VEHICLE_API_URL;
    if (!vehicleApiUrl) {
      return res.status(503).json({ message: "Vehicle lookup service is currently offline. Please try again later." });
    }
    await handleServiceRequest(req, res, "vehicle", result.data.number, async () => {
      const apiUrl = vehicleApiUrl.replace("{query}", result.data.number);
      const response = await fetch(apiUrl, { method: "GET", headers: { "Accept": "application/json" } });
      if (!response.ok) throw new Error(`Vehicle API failed: ${response.status} ${response.statusText}`);
      return await response.json();
    });
  });
  app2.post(api.services.ip.path, firebaseAuthMiddleware, async (req, res) => {
    const result = ipInfoSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid IP address" });
    await handleServiceRequest(req, res, "ip", result.data.ip, async () => {
      const apiUrl = (process.env.IP_API_URL || "https://ip-api.com/json/{query}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query").replace("{query}", result.data.ip);
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8e3);
      try {
        const response = await fetch(apiUrl, { signal: ctrl.signal });
        clearTimeout(t);
        if (!response.ok) {
          const fallback = await fetch(`https://ipapi.co/${result.data.ip}/json/`);
          if (!fallback.ok) throw new Error("IP lookup failed");
          return await fallback.json();
        }
        return await response.json();
      } catch (e) {
        clearTimeout(t);
        if (e.name === "AbortError") throw new Error("IP API timed out. Try again.");
        throw e;
      }
    });
  });
  app2.get(api.user.history.path, firebaseAuthMiddleware, async (req, res) => {
    const history = await storage.getRequestHistory(req.user.id);
    res.json(history);
  });
  app2.get("/api/user/notifications", firebaseAuthMiddleware, async (req, res) => {
    const notifs = await storage.getUserNotifications(req.user.id);
    res.json(notifs);
  });
  app2.get("/api/user/notifications/unread-count", firebaseAuthMiddleware, async (req, res) => {
    const count = await storage.getUnreadNotificationCount(req.user.id);
    res.json({ count });
  });
  app2.patch("/api/user/notifications/:id/read", firebaseAuthMiddleware, async (req, res) => {
    await storage.markNotificationRead(parseInt(req.params.id));
    res.json({ success: true });
  });
  app2.patch("/api/user/notifications/read-all", firebaseAuthMiddleware, async (req, res) => {
    await storage.markAllNotificationsRead(req.user.id);
    res.json({ success: true });
  });
  const { createHmac } = await import("crypto");
  function getAdminSecret() {
    return `${process.env.ADMIN_SECRET_ID || ""}:${process.env.ADMIN_SECRET_PASS || ""}:${process.env.SESSION_SECRET || "fallback"}`;
  }
  function signAdminToken() {
    const ts = Date.now().toString();
    const sig = createHmac("sha256", getAdminSecret()).update(ts).digest("hex");
    return `${ts}.${sig}`;
  }
  function verifyAdminToken(token) {
    try {
      const [ts, sig] = token.split(".");
      if (!ts || !sig) return false;
      const expected = createHmac("sha256", getAdminSecret()).update(ts).digest("hex");
      const age = Date.now() - parseInt(ts);
      return sig === expected && age > 0 && age < 24 * 60 * 60 * 1e3;
    } catch {
      return false;
    }
  }
  function parseCookies(req) {
    const header = req.headers.cookie || "";
    return Object.fromEntries(
      header.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k.trim(), decodeURIComponent(v.join("="))];
      }).filter(([k]) => k)
    );
  }
  const isProduction = process.env.NODE_ENV === "production";
  const requireAdminSession = (req, res, next) => {
    const cookies = parseCookies(req);
    const token = cookies["adminAuth"] || req.headers["x-admin-token"];
    if (!token || !verifyAdminToken(token)) {
      return res.status(401).json({ message: "Admin access required" });
    }
    next();
  };
  app2.post("/api/admin/login", (req, res) => {
    const { id, password } = req.body;
    if (id === process.env.ADMIN_SECRET_ID && password === process.env.ADMIN_SECRET_PASS) {
      const token = signAdminToken();
      const cookieFlags = [
        `adminAuth=${encodeURIComponent(token)}`,
        "HttpOnly",
        "Path=/",
        "Max-Age=86400",
        isProduction ? "Secure" : "",
        isProduction ? "SameSite=None" : "SameSite=Lax"
      ].filter(Boolean).join("; ");
      res.setHeader("Set-Cookie", cookieFlags);
      res.json({ success: true, token });
    } else {
      res.status(401).json({ message: "Invalid clearance code" });
    }
  });
  app2.post("/api/admin/logout", (_req, res) => {
    res.setHeader("Set-Cookie", "adminAuth=; HttpOnly; Path=/; Max-Age=0");
    res.json({ success: true });
  });
  app2.get("/api/admin/users", requireAdminSession, async (req, res) => {
    const usrs = await storage.getAllUsersWithStats();
    res.json(usrs);
  });
  app2.get("/api/admin/stats", requireAdminSession, async (req, res) => {
    const stats = await storage.getAdminStats();
    res.json(stats);
  });
  app2.get("/api/admin/db-size", requireAdminSession, async (req, res) => {
    try {
      const sizes = await storage.getDbSize();
      res.json(sizes);
    } catch (e) {
      res.json([]);
    }
  });
  app2.get("/api/admin/stats/charts", requireAdminSession, async (req, res) => {
    const days = parseInt(req.query.days) || 7;
    const data = await storage.getQueryChartData(Math.min(days, 30));
    res.json(data);
  });
  app2.get("/api/admin/users/:id/history", requireAdminSession, async (req, res) => {
    const history = await storage.getRequestHistory(req.params.id);
    res.json(history);
  });
  app2.get("/api/admin/logs", requireAdminSession, async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit || "300"), 500);
      const logs = await storage.getAllRequestLogs(limit);
      res.json(logs);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });
  app2.post("/api/admin/users/:id/block", requireAdminSession, async (req, res) => {
    const { blocked, blockIp } = req.body;
    const user = await storage.updateUser(req.params.id, {
      isBlocked: blocked,
      isIpBlocked: blockIp !== void 0 ? blockIp : void 0
    });
    res.json(user);
  });
  app2.patch("/api/admin/users/:id/limit", requireAdminSession, async (req, res) => {
    const { dailyQueryLimit } = req.body;
    const user = await storage.updateUser(req.params.id, {
      dailyQueryLimit: dailyQueryLimit === null || dailyQueryLimit === "" ? null : parseInt(dailyQueryLimit)
    });
    res.json(user);
  });
  app2.get("/api/admin/users/:id/notes", requireAdminSession, async (req, res) => {
    const notes = await storage.getUserNotes(req.params.id);
    res.json(notes);
  });
  app2.post("/api/admin/users/:id/notes", requireAdminSession, async (req, res) => {
    const { note } = req.body;
    if (!note?.trim()) return res.status(400).json({ message: "Note cannot be empty" });
    const n = await storage.addUserNote(req.params.id, note.trim());
    res.json(n);
  });
  app2.delete("/api/admin/notes/:id", requireAdminSession, async (req, res) => {
    await storage.deleteUserNote(parseInt(req.params.id));
    res.json({ success: true });
  });
  app2.get("/api/admin/users/:id/login-activity", requireAdminSession, async (req, res) => {
    const activity = await storage.getLoginActivity(req.params.id);
    res.json(activity);
  });
  app2.post("/api/admin/notifications", requireAdminSession, async (req, res) => {
    const { userId, title, message } = req.body;
    if (!userId || !title || !message) return res.status(400).json({ message: "userId, title, message required" });
    const n = await storage.createNotification(userId, title, message);
    const user = await storage.getUser(userId);
    sendTelegram(`\u{1F4E9} <b>NOTIFICATION SENT</b>
To: ${user?.username || user?.email || userId}
Title: ${title}
Msg: ${message}`);
    res.json(n);
  });
  app2.get("/api/admin/protected-numbers", requireAdminSession, async (req, res) => {
    const numbers = await storage.getProtectedNumbers();
    res.json(numbers);
  });
  app2.post("/api/admin/protected-numbers", requireAdminSession, async (req, res) => {
    const { number, reason } = req.body;
    if (!number) return res.status(400).json({ message: "Number is required" });
    await storage.addProtectedNumber(number, reason);
    res.json({ success: true });
  });
  app2.delete("/api/admin/protected-numbers/:number", requireAdminSession, async (req, res) => {
    await storage.removeProtectedNumber(req.params.number);
    res.json({ success: true });
  });
  app2.get("/api/broadcasts", async (req, res) => {
    const broadcasts = await storage.getActiveBroadcasts();
    res.json(broadcasts);
  });
  app2.post("/api/admin/broadcasts", requireAdminSession, async (req, res) => {
    const { title, message, type, mediaUrl, mediaType, actionLink, buttonText, durationMinutes, startsAt } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });
    const broadcast = await storage.createBroadcast({
      title: title || "SYSTEM BROADCAST",
      message,
      type: type || "INFO",
      mediaUrl,
      mediaType,
      actionLink,
      buttonText,
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : void 0,
      startsAt: startsAt || void 0
    });
    pushBroadcastEvent({ type: "broadcast_new", broadcast });
    res.json(broadcast);
  });
  app2.delete("/api/admin/broadcasts/:id", requireAdminSession, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteBroadcast(id);
    pushBroadcastEvent({ type: "broadcast_removed", id });
    res.json({ success: true });
  });
  app2.get("/api/admin/telegram/settings", requireAdminSession, async (_req, res) => {
    const token = await storage.getPlatformSetting("telegram_bot_token");
    const adminChatId = await storage.getPlatformSetting("telegram_admin_chat_id");
    res.json({
      botToken: token ? token.slice(0, 10) + "\u2026" : null,
      botTokenSet: !!token,
      adminChatId: adminChatId || null
    });
  });
  app2.post("/api/admin/telegram/settings", requireAdminSession, async (req, res) => {
    const { botToken, adminChatId } = req.body;
    if (botToken !== void 0) {
      await storage.setPlatformSetting("telegram_bot_token", botToken?.trim() || null);
    }
    if (adminChatId !== void 0) {
      await storage.setPlatformSetting("telegram_admin_chat_id", adminChatId?.trim() || null);
    }
    invalidateSettingsCache();
    res.json({ success: true });
  });
  app2.post("/api/admin/telegram/test", requireAdminSession, async (req, res) => {
    const { chatId } = req.body;
    if (!chatId) return res.status(400).json({ message: "chatId required" });
    const { token } = await getTelegramSettings();
    if (!token) return res.status(400).json({ message: "Bot token not set. Save it first." });
    try {
      const getMeRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const getMeData = await getMeRes.json();
      if (!getMeData.ok) {
        return res.status(400).json({ message: `Invalid bot token: ${getMeData.description || "Unauthorized"}` });
      }
    } catch (e) {
      return res.status(400).json({ message: `Cannot reach Telegram API: ${e.message}` });
    }
    const result = await sendTelegramToUser(
      chatId,
      '\u{1F9EA} <b>TWH_OSINT Test Message</b>\n\nTelegram is configured and working!\n\n\u{1F916} <a href="https://twh-osint.vercel.app/">TWH_OSINT Platform</a>\n\u{1F468}\u200D\u{1F4BB} @technicalwhitehat'
    );
    if (!result.ok) return res.status(400).json({ message: result.error || "Failed to send. Make sure you started the bot first (send /start to it)." });
    res.json({ success: true });
  });
  app2.get("/api/admin/telegram/users", requireAdminSession, async (_req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const linked = allUsers.filter((u) => u.telegramChatId).map((u) => ({
        id: u.id,
        email: u.email || null,
        username: u.username || null,
        telegramChatId: u.telegramChatId
      }));
      res.json(linked);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.delete("/api/admin/telegram/users/:userId", requireAdminSession, async (req, res) => {
    try {
      await storage.updateUser(req.params.userId, { telegramChatId: null });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ message: "Failed to remove Telegram link" });
    }
  });
  app2.post("/api/admin/telegram/users/:userId", requireAdminSession, async (req, res) => {
    const { chatId } = req.body;
    if (!chatId?.trim()) return res.status(400).json({ message: "chatId required" });
    try {
      await storage.updateUser(req.params.userId, { telegramChatId: chatId.trim() });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ message: "Failed to set Telegram link" });
    }
  });
  app2.post("/api/admin/telegram/broadcast", requireAdminSession, async (req, res) => {
    const { text: text3, buttons, mediaUrl, mediaType } = req.body;
    if (!text3?.trim()) return res.status(400).json({ message: "Message text is required" });
    const result = await sendTelegramBroadcast({ text: text3, buttons, mediaUrl, mediaType });
    if (result.noToken) return res.status(400).json({ message: "Bot token not configured. Set it first." });
    res.json({ success: true, sent: result.sent, failed: result.failed, total: result.total, failedIds: result.failedIds });
  });
  app2.post("/api/telegram/webhook", async (req, res) => {
    res.sendStatus(200);
    try {
      const update = req.body;
      const message = update?.message;
      if (!message?.text || !message?.chat?.id) return;
      const chatId = String(message.chat.id);
      const text3 = message.text.trim();
      if (text3.startsWith("/start")) {
        const parts = text3.split(" ");
        const uid = parts[1]?.trim();
        if (uid) {
          const existingUser = await storage.getUser(uid);
          if (existingUser) {
            await storage.updateUser(uid, { telegramChatId: chatId });
            await sendTelegramToUser(
              chatId,
              `\u2705 <b>Telegram linked successfully!</b>

Welcome, ${existingUser.username || existingUser.email || "User"}!

You'll now receive real-time alerts for every search on <b>TWH_OSINT</b>.

\u{1F916} <a href="https://twh-osint.vercel.app/">TWH_OSINT Platform</a>
\u{1F468}\u200D\u{1F4BB} @technicalwhitehat`
            );
          } else {
            await sendTelegramToUser(
              chatId,
              `\u274C <b>Account not found.</b>

Please make sure you are logged into the platform and click the Connect button again.

\u{1F916} <a href="https://twh-osint.vercel.app/">TWH_OSINT Platform</a>`
            );
          }
        } else {
          await sendTelegramToUser(
            chatId,
            `\u{1F44B} <b>Welcome to TWH_OSINT Bot!</b>

To link your account:
1. Go to your Dashboard
2. Click the <b>CONNECT TELEGRAM</b> button
3. You'll be linked automatically!

\u{1F916} <a href="https://twh-osint.vercel.app/">TWH_OSINT Platform</a>
\u{1F468}\u200D\u{1F4BB} @technicalwhitehat`
          );
        }
      }
    } catch (e) {
      console.error("[Telegram webhook] Error:", e.message);
    }
  });
  const domain = process.env.REPLIT_DEV_DOMAIN || "";
  if (domain) {
    setupTelegramWebhook(domain).catch(
      (e) => console.error("[Telegram] Webhook auto-setup failed:", e.message)
    );
  }
  return httpServer;
}

// api/_handler.ts
init_db();
var app = (0, import_express.default)();
var PgSession = (0, import_connect_pg_simple.default)(import_express_session.default);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
app.use(
  (0, import_express_session.default)({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      secure: true,
      sameSite: "none"
    },
    store: new PgSession({
      pool,
      tableName: "sessions",
      pruneSessionInterval: false,
      createTableIfMissing: true
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || "osint-secret-key"
  })
);
app.use(
  import_express.default.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(import_express.default.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      console.log(logLine);
    }
  });
  next();
});
var initPromise = registerRoutes(null, app).then(() => {
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    if (!res.headersSent) {
      res.status(status).json({ message: err.message || "Internal Server Error" });
    }
  });
}).catch((err) => {
  console.error("[handler] Route registration failed:", err);
});
async function handler(req, res) {
  try {
    await initPromise;
    return app(req, res);
  } catch (err) {
    console.error("[handler] Unhandled error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
module.exports = handler;
