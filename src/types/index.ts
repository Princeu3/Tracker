import type {
  ColumnType,
  ColumnConfig,
  CellValue,
  SelectOption,
} from "@/db/schema/tracker";

export type { ColumnType, ColumnConfig, CellValue, SelectOption };

export type Tracker = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  icon: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Column = {
  id: string;
  trackerId: string;
  name: string;
  type: ColumnType;
  order: number;
  config: ColumnConfig | null;
  required: boolean | null;
  createdAt: Date;
};

export type Row = {
  id: string;
  trackerId: string;
  data: Record<string, CellValue>;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Attachment = {
  id: string;
  userId: string;
  trackerId: string | null;
  rowId: string | null;
  columnId: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  createdAt: Date;
};

export type ChatConversation = {
  id: string;
  userId: string;
  trackerId: string | null;
  title: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
};

export type SchemaColumn = {
  name: string;
  type: ColumnType;
  required?: boolean;
  config?: ColumnConfig;
};

export type GeneratedSchema = {
  name: string;
  description: string;
  columns: SchemaColumn[];
};
