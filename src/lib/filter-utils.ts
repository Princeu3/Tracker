import type { Row, ColumnType } from "@/types";

export type ColumnFilter = {
  columnId: string;
  columnType: ColumnType;
  textValue?: string;
  min?: number;
  max?: number;
  dateFrom?: string;
  dateTo?: string;
  selectedValues?: string[];
  checkboxValue?: boolean | null;
  hasFiles?: boolean | null;
};

export function applyFilters(rows: Row[], filters: ColumnFilter[]): Row[] {
  if (filters.length === 0) return rows;

  return rows.filter((row) =>
    filters.every((filter) => matchesFilter(row.data[filter.columnId], filter))
  );
}

function matchesFilter(value: unknown, filter: ColumnFilter): boolean {
  switch (filter.columnType) {
    case "text":
    case "email":
    case "url": {
      if (!filter.textValue) return true;
      const str = String(value ?? "").toLowerCase();
      return str.includes(filter.textValue.toLowerCase());
    }

    case "number":
    case "currency": {
      if (filter.min == null && filter.max == null) return true;
      const num = value as number | null;
      if (num == null) return false;
      if (filter.min != null && num < filter.min) return false;
      if (filter.max != null && num > filter.max) return false;
      return true;
    }

    case "date": {
      if (!filter.dateFrom && !filter.dateTo) return true;
      const dateStr = value as string | null;
      if (!dateStr) return false;
      const date = new Date(dateStr).getTime();
      if (filter.dateFrom && date < new Date(filter.dateFrom).getTime()) return false;
      if (filter.dateTo && date > new Date(filter.dateTo + "T23:59:59").getTime()) return false;
      return true;
    }

    case "select": {
      if (!filter.selectedValues || filter.selectedValues.length === 0) return true;
      return filter.selectedValues.includes(String(value ?? ""));
    }

    case "multi_select": {
      if (!filter.selectedValues || filter.selectedValues.length === 0) return true;
      const arr = (value as string[]) || [];
      return filter.selectedValues.some((sv) => arr.includes(sv));
    }

    case "checkbox": {
      if (filter.checkboxValue == null) return true;
      return (value === true) === filter.checkboxValue;
    }

    case "file": {
      if (filter.hasFiles == null) return true;
      const files = (value as string[]) || [];
      return filter.hasFiles ? files.length > 0 : files.length === 0;
    }

    default:
      return true;
  }
}

export function getFilterSummary(filter: ColumnFilter): string {
  switch (filter.columnType) {
    case "text":
    case "email":
    case "url":
      return `contains "${filter.textValue}"`;
    case "number":
    case "currency": {
      if (filter.min != null && filter.max != null) return `${filter.min} - ${filter.max}`;
      if (filter.min != null) return `>= ${filter.min}`;
      return `<= ${filter.max}`;
    }
    case "date": {
      if (filter.dateFrom && filter.dateTo) return `${filter.dateFrom} to ${filter.dateTo}`;
      if (filter.dateFrom) return `from ${filter.dateFrom}`;
      return `to ${filter.dateTo}`;
    }
    case "select":
    case "multi_select":
      return `${filter.selectedValues?.length} selected`;
    case "checkbox":
      return filter.checkboxValue ? "checked" : "unchecked";
    case "file":
      return filter.hasFiles ? "has files" : "no files";
    default:
      return "filtered";
  }
}
