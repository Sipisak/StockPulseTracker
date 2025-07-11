import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  changeAmount: decimal("change_amount", { precision: 10, scale: 2 }).notNull(),
  changePercent: decimal("change_percent", { precision: 5, scale: 2 }).notNull(),
  volume: integer("volume").notNull(),
  marketCap: decimal("market_cap", { precision: 15, scale: 2 }),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const watchlists = pgTable("watchlists", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("anonymous"),
  symbol: text("symbol").notNull(),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("anonymous"),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(), // "price_above", "price_below", "volume_spike"
  targetValue: decimal("target_value", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("anonymous"),
  symbol: text("symbol").notNull(),
  shares: decimal("shares", { precision: 10, scale: 4 }).notNull(),
  avgCost: decimal("avg_cost", { precision: 10, scale: 2 }).notNull(),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

export const marketIndices = pgTable("market_indices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  symbol: text("symbol").notNull().unique(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  changeAmount: decimal("change_amount", { precision: 10, scale: 2 }).notNull(),
  changePercent: decimal("change_percent", { precision: 5, scale: 2 }).notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  lastUpdated: true,
});

export const insertWatchlistSchema = createInsertSchema(watchlists).omit({
  id: true,
  addedAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  addedAt: true,
});

export const insertMarketIndexSchema = createInsertSchema(marketIndices).omit({
  id: true,
  lastUpdated: true,
});

export type Stock = typeof stocks.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;
export type Watchlist = typeof watchlists.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type MarketIndex = typeof marketIndices.$inferSelect;
export type InsertMarketIndex = z.infer<typeof insertMarketIndexSchema>;
