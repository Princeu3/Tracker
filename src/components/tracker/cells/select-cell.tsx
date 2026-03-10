"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { colorMap } from "@/lib/color-map";
import type { SelectOption } from "@/types";

type Props = {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
};

export function SelectCell({ value, options, onChange }: Props) {
  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-full border-0 rounded-none bg-transparent shadow-none transition-all duration-150 focus:ring-0">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <Badge
              variant="secondary"
              className={colorMap[opt.color || "gray"] || colorMap.gray}
            >
              {opt.label}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
