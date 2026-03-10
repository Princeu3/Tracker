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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, X, Plus } from "lucide-react";
import { COLUMN_TYPES, SELECT_COLORS } from "@/lib/constants";
import { colorMap, dotColorMap } from "@/lib/color-map";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { Column, ColumnType, ColumnConfig, SelectOption } from "@/types";

type Props = {
  column: Column;
  onUpdate: (data: { name?: string; type?: ColumnType; config?: ColumnConfig }) => void;
  onDelete: () => void;
  children: React.ReactNode;
};

export function ColumnHeaderPopover({ column, onUpdate, onDelete, children }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(column.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newOptionLabel, setNewOptionLabel] = useState("");

  const options: SelectOption[] = column.config?.options || [];
  const hasOptions = column.type === "select" || column.type === "multi_select";
  const hasCurrency = column.type === "currency";

  function commitName() {
    const trimmed = name.trim();
    if (trimmed && trimmed !== column.name) {
      onUpdate({ name: trimmed });
    }
  }

  function handleTypeChange(type: ColumnType) {
    onUpdate({ type });
  }

  function updateOptions(newOptions: SelectOption[]) {
    onUpdate({ config: { ...column.config, options: newOptions } });
  }

  function addOption() {
    const label = newOptionLabel.trim();
    if (!label) return;
    const value = label.toLowerCase().replace(/\s+/g, "_");
    updateOptions([...options, { label, value, color: "gray" }]);
    setNewOptionLabel("");
  }

  function removeOption(index: number) {
    updateOptions(options.filter((_, i) => i !== index));
  }

  function updateOptionColor(index: number, color: string) {
    const updated = [...options];
    updated[index] = { ...updated[index], color };
    updateOptions(updated);
  }

  function updateOptionLabel(index: number, label: string) {
    const updated = [...options];
    updated[index] = { ...updated[index], label };
    updateOptions(updated);
  }

  function handleCurrencyChange(currencyCode: string) {
    onUpdate({ config: { ...column.config, currencyCode } });
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="start">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => e.key === "Enter" && commitName()}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={column.type} onValueChange={(v) => handleTypeChange(v as ColumnType)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLUMN_TYPES.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>
                      {ct.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasOptions && (
              <div className="space-y-1.5">
                <Label className="text-xs">Options</Label>
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <ColorDot
                        color={opt.color || "gray"}
                        onChange={(c) => updateOptionColor(idx, c)}
                      />
                      <Input
                        value={opt.label}
                        onChange={(e) => updateOptionLabel(idx, e.target.value)}
                        onBlur={() => {
                          if (!opt.label.trim()) removeOption(idx);
                        }}
                        className="h-7 flex-1 text-xs"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => removeOption(idx)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    value={newOptionLabel}
                    onChange={(e) => setNewOptionLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addOption()}
                    placeholder="New option..."
                    className="h-7 flex-1 text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={addOption}
                    disabled={!newOptionLabel.trim()}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {hasCurrency && (
              <div className="space-y-1.5">
                <Label className="text-xs">Currency</Label>
                <Select
                  value={column.config?.currencyCode || "USD"}
                  onValueChange={handleCurrencyChange}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "BRL"].map(
                      (code) => (
                        <SelectItem key={code} value={code}>
                          {code}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator />

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => {
                setOpen(false);
                setShowDeleteConfirm(true);
              }}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete column
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete column"
        description="This action cannot be undone. This will permanently delete this column and all its data across every row."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={onDelete}
      />
    </>
  );
}

function ColorDot({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "h-4 w-4 shrink-0 rounded-full border border-border/50",
            dotColorMap[color] || dotColorMap.gray
          )}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="grid grid-cols-6 gap-1">
          {SELECT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
              className={cn(
                "h-5 w-5 rounded-full border-2 transition-transform hover:scale-110",
                dotColorMap[c] || dotColorMap.gray,
                c === color ? "border-foreground" : "border-transparent"
              )}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
