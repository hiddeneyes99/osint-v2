import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, integer, text, boolean } from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: text("username").unique(),
  role: text("role").notNull().default("user"),
  isBlocked: boolean("is_blocked").notNull().default(false),
  lastIp: text("last_ip"),
  isIpBlocked: boolean("is_ip_blocked").notNull().default(false),
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  privacyAccepted: boolean("privacy_accepted").notNull().default(false),
  credits: integer("credits").notNull().default(10),
  dailyQueryLimit: integer("daily_query_limit"),
  telegramChatId: text("telegram_chat_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
