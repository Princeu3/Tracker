"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { colorMap } from "@/lib/color-map";
import type { ColumnFilter as ColumnFilterType } from "@/lib/filter-utils";
import type { Column } from "@/types";

type Props = {
  column: Column;
  filter: ColumnFilterType | undefined;
  onFilterChange: (filter: ColumnFilterType | null) => void;
};

export function ColumnFilterPopover({ column, filter, onFilterChange }: Props) {
  const [open, setOpen] = useState(false);
  const isActive = !!filter;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center justify-center h-5 w-5 rounded-sm hover:bg-accent",
            isActive ? "text-primary" : "text-muted-foreground/40"
          )}
        >
          <Filter className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start">
        <FilterContent
          column={column}
          filter={filter}
          onFilterChange={(f) => {
            onFilterChange(f);
            if (!f) setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function FilterContent({
  column,
  filter,
  onFilterChange,
}: {
  column: Column;
  filter: ColumnFilterType | undefined;
  onFilterChange: (filter: ColumnFilterType | null) => void;
}) {
  const base = { columnId: column.id, columnType: column.type };

  switch (column.type) {
    case "text":
    case "email":
    case "url":
      return (
        <div className="space-y-2">
          <Label className="text-xs">Contains</Label>
          <Input
            value={filter?.textValue || ""}
            onChange={(e) => {
              const v = e.target.value;
              onFilterChange(v ? { ...base, textValue: v } : null);
            }}
            placeholder="Search..."
            className="h-8 text-sm"
          />
          {filter && (
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => onFilterChange(null)}>
              Clear
            </Button>
          )}
        </div>
      );

    case "number":
    case "currency":
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">Min</Label>
            <Input
              type="number"
              value={filter?.min ?? ""}
              onChange={(e) => {
                const min = e.target.value === "" ? undefined : Number(e.target.value);
                const max = filter?.max;
                if (min == null && max == null) { onFilterChange(null); return; }
                onFilterChange({ ...base, min, max });
              }}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Max</Label>
            <Input
              type="number"
              value={filter?.max ?? ""}
              onChange={(e) => {
                const max = e.target.value === "" ? undefined : Number(e.target.value);
                const min = filter?.min;
                if (min == null && max == null) { onFilterChange(null); return; }
                onFilterChange({ ...base, min, max });
              }}
              className="h-8 text-sm"
            />
          </div>
          {filter && (
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => onFilterChange(null)}>
              Clear
            </Button>
          )}
        </div>
      );

    case "date":
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">From</Label>
            <Input
              type="date"
              value={filter?.dateFrom || ""}
              onChange={(e) => {
                const dateFrom = e.target.value || undefined;
                const dateTo = filter?.dateTo;
                if (!dateFrom && !dateTo) { onFilterChange(null); return; }
                onFilterChange({ ...base, dateFrom, dateTo });
              }}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              value={filter?.dateTo || ""}
              onChange={(e) => {
                const dateTo = e.target.value || undefined;
                const dateFrom = filter?.dateFrom;
                if (!dateFrom && !dateTo) { onFilterChange(null); return; }
                onFilterChange({ ...base, dateFrom, dateTo });
              }}
              className="h-8 text-sm"
            />
          </div>
          {filter && (
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => onFilterChange(null)}>
              Clear
            </Button>
          )}
        </div>
      );

    case "select":
    case "multi_select": {
      const options = column.config?.options || [];
      const selected = filter?.selectedValues || [];

      function toggle(val: string) {
        const next = selected.includes(val)
          ? selected.filter((v) => v !== val)
          : [...selected, val];
        onFilterChange(next.length > 0 ? { ...base, selectedValues: next } : null);
      }

      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Options</Label>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1 text-[10px]"
                onClick={() =>
                  onFilterChange({
                    ...base,
                    selectedValues: options.map((o) => o.value),
                  })
                }
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1 text-[10px]"
                onClick={() => onFilterChange(null)}
              >
                Clear
              </Button>
            </div>
          </div>
          <div className="max-h-48 space-y-0.5 overflow-y-auto">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 rounded-sm px-1 py-1 text-sm hover:bg-accent cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                  className="h-3.5 w-3.5 rounded border-border"
                />
                <Badge
                  variant="secondary"
                  className={cn("text-xs", colorMap[opt.color || "gray"] || colorMap.gray)}
                >
                  {opt.label}
                </Badge>
              </label>
            ))}
          </div>
        </div>
      );
    }

    case "checkbox": {
      const val = filter?.checkboxValue;
      return (
        <div className="space-y-1">
          <Label className="text-xs">Show</Label>
          {[
            { label: "All", value: null },
            { label: "Checked", value: true },
            { label: "Unchecked", value: false },
          ].map((opt) => (
            <label
              key={String(opt.value)}
              className="flex items-center gap-2 rounded-sm px-1 py-1 text-sm hover:bg-accent cursor-pointer"
            >
              <input
                type="radio"
                name={`checkbox-filter-${column.id}`}
                checked={val === opt.value}
                onChange={() =>
                  onFilterChange(
                    opt.value == null ? null : { ...base, checkboxValue: opt.value }
                  )
                }
                className="h-3.5 w-3.5"
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    }

    case "file": {
      const val = filter?.hasFiles;
      return (
        <div className="space-y-1">
          <Label className="text-xs">Show</Label>
          {[
            { label: "All", value: null },
            { label: "Has files", value: true },
            { label: "No files", value: false },
          ].map((opt) => (
            <label
              key={String(opt.value)}
              className="flex items-center gap-2 rounded-sm px-1 py-1 text-sm hover:bg-accent cursor-pointer"
            >
              <input
                type="radio"
                name={`file-filter-${column.id}`}
                checked={val === opt.value}
                onChange={() =>
                  onFilterChange(
                    opt.value == null ? null : { ...base, hasFiles: opt.value }
                  )
                }
                className="h-3.5 w-3.5"
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}
