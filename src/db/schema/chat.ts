import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./auth";
import { trackers } from "./tracker";

export const chatConversations = pgTable("chat_conversations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  trackerId: text("tracker_id").references(() => trackers.id, {
    onDelete: "set null",
  }),
  title: text("title").default("New Conversation"),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => chatConversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
