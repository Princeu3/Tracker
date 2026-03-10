import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./auth";

// Types (declared before tables since they're used in $type<>())

export type ColumnType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "multi_select"
  | "checkbox"
  | "url"
  | "email"
  | "currency"
  | "file";

export type SelectOption = {
  label: string;
  value: string;
  color?: string;
};

export type CellValue =
  | string
  | number
  | boolean
  | string[]
  | null;

export type ColumnConfig = {
  options?: SelectOption[];
  currencyCode?: string;
  dateFormat?: string;
  placeholder?: string;
  defaultValue?: CellValue;
};

// Tables

export const trackers = pgTable("trackers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").default("table"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const trackerColumns = pgTable("tracker_columns", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  trackerId: text("tracker_id")
    .notNull()
    .references(() => trackers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").$type<ColumnType>().notNull().default("text"),
  order: integer("order").notNull().default(0),
  config: jsonb("config").$type<ColumnConfig>().default({}),
  required: boolean("required").default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const trackerRows = pgTable("tracker_rows", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  trackerId: text("tracker_id")
    .notNull()
    .references(() => trackers.id, { onDelete: "cascade" }),
  data: jsonb("data").$type<Record<string, CellValue>>().default({}).notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
