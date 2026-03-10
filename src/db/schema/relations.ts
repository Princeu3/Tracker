import { relations } from "drizzle-orm";
import { users, accounts, sessions } from "./auth";
import { trackers, trackerColumns, trackerRows } from "./tracker";
import { attachments } from "./attachments";
import { chatConversations, chatMessages } from "./chat";

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  trackers: many(trackers),
  attachments: many(attachments),
  chatConversations: many(chatConversations),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const trackersRelations = relations(trackers, ({ one, many }) => ({
  user: one(users, { fields: [trackers.userId], references: [users.id] }),
  columns: many(trackerColumns),
  rows: many(trackerRows),
  attachments: many(attachments),
  chatConversations: many(chatConversations),
}));

export const trackerColumnsRelations = relations(
  trackerColumns,
  ({ one }) => ({
    tracker: one(trackers, {
      fields: [trackerColumns.trackerId],
      references: [trackers.id],
    }),
  })
);

export const trackerRowsRelations = relations(trackerRows, ({ one }) => ({
  tracker: one(trackers, {
    fields: [trackerRows.trackerId],
    references: [trackers.id],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  user: one(users, { fields: [attachments.userId], references: [users.id] }),
  tracker: one(trackers, {
    fields: [attachments.trackerId],
    references: [trackers.id],
  }),
  row: one(trackerRows, {
    fields: [attachments.rowId],
    references: [trackerRows.id],
  }),
  column: one(trackerColumns, {
    fields: [attachments.columnId],
    references: [trackerColumns.id],
  }),
}));

export const chatConversationsRelations = relations(
  chatConversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [chatConversations.userId],
      references: [users.id],
    }),
    tracker: one(trackers, {
      fields: [chatConversations.trackerId],
      references: [trackers.id],
    }),
    messages: many(chatMessages),
  })
);

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
}));
