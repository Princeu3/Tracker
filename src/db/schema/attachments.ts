import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./auth";
import { trackers, trackerRows, trackerColumns } from "./tracker";

export const attachments = pgTable("attachments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  trackerId: text("tracker_id").references(() => trackers.id, {
    onDelete: "set null",
  }),
  rowId: text("row_id").references(() => trackerRows.id, {
    onDelete: "set null",
  }),
  columnId: text("column_id").references(() => trackerColumns.id, {
    onDelete: "set null",
  }),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  storagePath: text("storage_path").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
