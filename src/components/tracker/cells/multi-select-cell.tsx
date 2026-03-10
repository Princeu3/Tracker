"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { colorMap } from "@/lib/color-map";
import type { SelectOption } from "@/types";

type Props = {
  value: string[];
  options: SelectOption[];
  onChange: (value: string[]) => void;
};

export function MultiSelectCell({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const selected = value || [];

  function toggle(optValue: string) {
    const next = selected.includes(optValue)
      ? selected.filter((v) => v !== optValue)
      : [...selected, optValue];
    onChange(next);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-full justify-start px-2 text-left font-normal transition-all duration-150"
        >
          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selected.map((v) => {
                const opt = options.find((o) => o.value === v);
                return (
                  <Badge
                    key={v}
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      colorMap[opt?.color || "gray"] || colorMap.gray
                    )}
                  >
                    {opt?.label || v}
                  </Badge>
                );
              })}
            </div>
          ) : (
            <span className="text-muted-foreground">Select...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
          >
            <Check
              className={cn(
                "h-4 w-4",
                selected.includes(opt.value) ? "opacity-100" : "opacity-0"
              )}
            />
            <Badge
              variant="secondary"
              className={colorMap[opt.color || "gray"] || colorMap.gray}
            >
              {opt.label}
            </Badge>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
