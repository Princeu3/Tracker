import type { CellValue, ColumnType } from "@/types";

export function compareCellValues(
  aVal: CellValue,
  bVal: CellValue,
  columnType: ColumnType
): number {
  if (aVal == null && bVal == null) return 0;
  if (aVal == null) return 1;
  if (bVal == null) return -1;

  switch (columnType) {
    case "number":
    case "currency":
      return (aVal as number) - (bVal as number);

    case "date":
      return new Date(aVal as string).getTime() - new Date(bVal as string).getTime();

    case "checkbox":
      return (aVal === true ? 1 : 0) - (bVal === true ? 1 : 0);

    case "multi_select": {
      const aArr = (aVal as string[]) || [];
      const bArr = (bVal as string[]) || [];
      if (aArr.length !== bArr.length) return aArr.length - bArr.length;
      return aArr.join(",").localeCompare(bArr.join(","));
    }

    case "file": {
      const aFiles = (aVal as string[]) || [];
      const bFiles = (bVal as string[]) || [];
      return aFiles.length - bFiles.length;
    }

    default:
      return String(aVal).localeCompare(String(bVal));
  }
}
