"use client";

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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Sparkles, Loader2 } from "lucide-react";
import { COLUMN_TYPES } from "@/lib/constants";
import type { GeneratedSchema, SchemaColumn, ColumnType } from "@/types";

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
                  {col.config?.options && col.config.options.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {col.config.options.map((opt) => (
                        <Badge
                          key={opt.value}
                          variant="secondary"
                          className="text-xs"
                        >
                          {opt.label}
                        </Badge>
                      ))}
                    </div>
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
