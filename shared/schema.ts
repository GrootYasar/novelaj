import { pgTable, text, serial, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  chapter_url: text("chapter_url").notNull().unique(),
  chapter_title: text("chapter_title").notNull(),
  translated_content: text("translated_content").notNull(),
  prev_chapter: text("prev_chapter"),
  next_chapter: text("next_chapter"),
  book_number: varchar("book_number", { length: 50 }).notNull(),
  chapter_number: varchar("chapter_number", { length: 50 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;
