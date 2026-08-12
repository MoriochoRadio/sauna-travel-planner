import { boolean, int, json, mysqlEnum, mysqlTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const places = mysqlTable("places", {
  id: varchar("id", { length: 128 }).primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  category: mysqlEnum("category", ["sauna", "jjimjilbang", "hot-spring"]).notNull(),
  region: varchar("region", { length: 80 }).notNull(),
  city: varchar("city", { length: 80 }).notNull(),
  address: text("address"),
  summary: text("summary").notNull(),
  sourceUrl: text("sourceUrl"),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const favoritePlaces = mysqlTable("favoritePlaces", {
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  placeId: varchar("placeId", { length: 128 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [primaryKey({ columns: [table.userId, table.placeId] })]);

export const tripPlans = mysqlTable("tripPlans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 120 }).notNull(),
  region: varchar("region", { length: 80 }).notNull(),
  coverPlaceId: varchar("coverPlaceId", { length: 128 }),
  isArchived: boolean("isArchived").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const tripPlanStops = mysqlTable("tripPlanStops", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull().references(() => tripPlans.id, { onDelete: "cascade" }),
  placeId: varchar("placeId", { length: 128 }).notNull(),
  position: int("position").notNull(),
  note: varchar("note", { length: 240 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const recommendationHistory = mysqlTable("recommendationHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  region: varchar("region", { length: 80 }).notNull(),
  preference: json("preference").notNull(),
  itinerary: json("itinerary").notNull(),
  source: mysqlEnum("source", ["ai", "curated"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const visitRecords = mysqlTable("visitRecords", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  placeId: varchar("placeId", { length: 128 }).notNull(),
  note: varchar("note", { length: 240 }),
  visitedAt: timestamp("visitedAt").defaultNow().notNull(),
});
