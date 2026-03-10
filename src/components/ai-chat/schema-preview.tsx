"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, X, Sparkles, Loader2 } from "lucide-react";
import { COLUMN_TYPES, SELECT_COLORS } from "@/lib/constants";
import { dotColorMap } from "@/lib/color-map";
import { cn } from "@/lib/utils";
import type { GeneratedSchema, SchemaColumn, ColumnType, SelectOption } from "@/types";

type Props = {
  schema: GeneratedSchema;
  onChange: (schema: GeneratedSchema) => void;
  onCreateTracker: (schema: GeneratedSchema) => void;
  isCreating: boolean;
};

export function SchemaPreview({
  schema,
  onChange,
  onCreateTracker,
  isCreating,
}: Props) {
  function updateColumn(index: number, updates: Partial<SchemaColumn>) {
    const newColumns = [...schema.columns];
    newColumns[index] = { ...newColumns[index], ...updates };
    onChange({ ...schema, columns: newColumns });
  }

  function removeColumn(index: number) {
    onChange({
      ...schema,
      columns: schema.columns.filter((_, i) => i !== index),
    });
  }

  function addColumn() {
    onChange({
      ...schema,
      columns: [
        ...schema.columns,
        { name: "New Column", type: "text" as ColumnType },
      ],
    });
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold">Schema Preview</h3>
      </div>

      <div className="space-y-2">
        <Label>Tracker Name</Label>
        <Input
          value={schema.name}
          onChange={(e) => onChange({ ...schema, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={schema.description}
          onChange={(e) =>
            onChange({ ...schema, description: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Columns ({schema.columns.length})</Label>
          <Button variant="ghost" size="sm" onClick={addColumn}>
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-auto">
          {schema.columns.map((col, idx) => (
            <Card key={idx} className="p-3 transition-all duration-150 hover:shadow-sm">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    value={col.name}
                    onChange={(e) =>
                      updateColumn(idx, { name: e.target.value })
                    }
                    className="h-8 text-sm"
                  />
                  <Select
                    value={col.type}
                    onValueChange={(v) =>
                      updateColumn(idx, { type: v as ColumnType })
                    }
                  >
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
                  {(col.type === "select" || col.type === "multi_select") && (
                    <OptionEditor
                      options={col.config?.options || []}
                      onChange={(options) =>
                        updateColumn(idx, {
                          config: { ...col.config, options },
                        })
                      }
                    />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeColumn(idx)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Button
        onClick={() => onCreateTracker(schema)}
        disabled={isCreating || !schema.name.trim() || schema.columns.length === 0}
        className="w-full"
      >
        {isCreating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Create Tracker
          </>
        )}
      </Button>
    </div>
  );
}

function OptionEditor({
  options,
  onChange,
}: {
  options: SelectOption[];
  onChange: (options: SelectOption[]) => void;
}) {
  const [newLabel, setNewLabel] = useState("");

  function addOption() {
    const label = newLabel.trim();
    if (!label) return;
    const value = label.toLowerCase().replace(/\s+/g, "_");
    onChange([...options, { label, value, color: "gray" }]);
    setNewLabel("");
  }

  function removeOption(index: number) {
    onChange(options.filter((_, i) => i !== index));
  }

  function updateLabel(index: number, label: string) {
    const updated = [...options];
    updated[index] = { ...updated[index], label };
    onChange(updated);
  }

  function updateColor(index: number, color: string) {
    const updated = [...options];
    updated[index] = { ...updated[index], color };
    onChange(updated);
  }

  return (
    <div className="space-y-1">
      <div className="max-h-36 space-y-1 overflow-y-auto">
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <ColorDot
              color={opt.color || "gray"}
              onChange={(c) => updateColor(idx, c)}
            />
            <Input
              value={opt.label}
              onChange={(e) => updateLabel(idx, e.target.value)}
              onBlur={() => {
                if (!opt.label.trim()) removeOption(idx);
              }}
              className="h-6 flex-1 text-xs"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0"
              onClick={() => removeOption(idx)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addOption()}
          placeholder="New option..."
          className="h-6 flex-1 text-xs"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0"
          onClick={addOption}
          disabled={!newLabel.trim()}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
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
