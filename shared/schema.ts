import { pgTable, text, serial, boolean, timestamp, varchar, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

export const requestLogs = pgTable("request_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  service: text("service").notNull(),
  query: text("query").notNull(),
  status: text("status").notNull(),
  result: jsonb("result"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const protectedNumbers = pgTable("protected_numbers", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const broadcastMessages = pgTable("broadcast_messages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("SYSTEM BROADCAST"),
  message: text("message").notNull(),
  type: text("type").notNull().default("INFO"),
  mediaUrl: text("media_url"),
  mediaType: text("media_type"),
  actionLink: text("action_link"),
  buttonText: text("button_text").default("LEARN MORE"),
  isActive: boolean("is_active").notNull().default(true),
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const platformSettings = pgTable("platform_settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PlatformSetting = typeof platformSettings.$inferSelect;

export const userNotes = pgTable("user_notes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loginActivity = pgTable("login_activity", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default(""),
  type: text("type").notNull().default("IMAGE"),
  mediaUrl: text("media_url"),
  htmlContent: text("html_content"),
  linkUrl: text("link_url"),
  logoUrl: text("logo_url"),
  description: text("description"),
  buttonText: text("button_text").default("Learn More"),
  buttonColor: text("button_color").default("#7c3aed"),
  forceRedirect: boolean("force_redirect").notNull().default(false),
  duration: integer("duration").notNull().default(15),
  isActive: boolean("is_active").notNull().default(true),
  views: integer("views").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Ad = typeof ads.$inferSelect;

// === SCHEMAS ===
export const insertRequestLogSchema = createInsertSchema(requestLogs).omit({ id: true, createdAt: true });
export const insertProtectedNumberSchema = createInsertSchema(protectedNumbers).omit({ id: true, createdAt: true });

// === TYPES ===
export type RequestLog = typeof requestLogs.$inferSelect;
export type BroadcastMessage = typeof broadcastMessages.$inferSelect;
export type UserNote = typeof userNotes.$inferSelect;
export type LoginActivity = typeof loginActivity.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

// Service Request Schemas
export const mobileInfoSchema = z.object({
  number: z.string().regex(/^[0-9]{10}$/, "Must be a valid 10-digit Indian mobile number"),
});

export const aadharInfoSchema = z.object({
  number: z.string().regex(/^[0-9]{12}$/, "Must be a valid 12-digit Aadhar number"),
});

export const vehicleInfoSchema = z.object({
  number: z.string().regex(/^[A-Za-z]{2}[0-9]{2}[A-Za-z0-9]+$/, "Must start with 2 letters, 2 numbers, then alphanumeric"),
});

export const emailInfoSchema = z.object({
  email: z.string().email("Must be a valid email address"),
});

export const ipInfoSchema = z.object({
  ip: z.string().ip({ version: "v4", message: "Must be a valid IPv4 address" }),
});

export interface ServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
}
