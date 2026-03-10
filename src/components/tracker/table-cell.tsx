"use client";

import type { Column, CellValue, Attachment } from "@/types";
import { TextCell } from "./cells/text-cell";
import { NumberCell } from "./cells/number-cell";
import { DateCell } from "./cells/date-cell";
import { CheckboxCell } from "./cells/checkbox-cell";
import { SelectCell } from "./cells/select-cell";
import { MultiSelectCell } from "./cells/multi-select-cell";
import { UrlCell } from "./cells/url-cell";
import { CurrencyCell } from "./cells/currency-cell";
import { FileCell } from "./cells/file-cell";

type Props = {
  column: Column;
  value: CellValue;
  onChange: (value: CellValue) => void;
  rowId: string;
  trackerId: string;
  attachments: Attachment[];
};

export function TableCell({ column, value, onChange, rowId, trackerId, attachments }: Props) {
  switch (column.type) {
    case "text":
    case "email":
      return (
        <TextCell
          value={(value as string) || ""}
          onChange={onChange}
        />
      );
    case "number":
      return (
        <div className="text-right">
          <NumberCell
            value={value as number | null}
            onChange={onChange}
          />
        </div>
      );
    case "date":
      return (
        <DateCell
          value={(value as string) || ""}
          onChange={onChange}
        />
      );
    case "checkbox":
      return (
        <CheckboxCell
          value={(value as boolean) || false}
          onChange={onChange}
        />
      );
    case "select":
      return (
        <SelectCell
          value={(value as string) || ""}
          options={column.config?.options || []}
          onChange={onChange}
        />
      );
    case "multi_select":
      return (
        <MultiSelectCell
          value={(value as string[]) || []}
          options={column.config?.options || []}
          onChange={onChange}
        />
      );
    case "url":
      return (
        <UrlCell
          value={(value as string) || ""}
          onChange={onChange}
        />
      );
    case "currency":
      return (
        <div className="text-right">
          <CurrencyCell
            value={value as number | null}
            currencyCode={column.config?.currencyCode}
            onChange={onChange}
          />
        </div>
      );
    case "file":
      return (
        <FileCell
          value={(value as string[]) || []}
          attachments={attachments}
          trackerId={trackerId}
          rowId={rowId}
          columnId={column.id}
          onChange={onChange}
        />
      );
    default:
      return (
        <TextCell
          value={(value as string) || ""}
          onChange={onChange}
        />
      );
  }
}
